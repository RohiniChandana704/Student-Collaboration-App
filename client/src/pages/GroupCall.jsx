import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../services/socket";
import "./GroupCall.css";

// Free public STUN server - helps peers discover their public network address.
// This does NOT relay your audio/video, it only helps set up the direct connection.
const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function GroupCall() {
  const { id } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // socketId -> RTCPeerConnection

  const [remoteStreams, setRemoteStreams] = useState({}); // socketId -> MediaStream
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      alert("Chat connection not ready. Open the group chat first.");
      navigate(`/groups/${id}/chat`);
      return;
    }

    let isMounted = true;

    const setup = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (!isMounted) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      socket.emit("join_call", id);
    };

    const createPeerConnection = (remoteSocketId) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc_ice_candidate", {
            to: remoteSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        setRemoteStreams((prev) => ({
          ...prev,
          [remoteSocketId]: event.streams[0],
        }));
      };

      peersRef.current[remoteSocketId] = pc;
      return pc;
    };

    // Call is full - server rejected the join
    socket.on("call_full", () => {
      alert("This call is full (max 6 participants). Please try again later.");
      isMounted = false;
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      navigate(`/groups/${id}/chat`);
    });

    // I'm the new joiner: create an offer for each person already in the call
    socket.on("existing_call_users", async (socketIds) => {
      for (const remoteSocketId of socketIds) {
        const pc = createPeerConnection(remoteSocketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc_offer", { to: remoteSocketId, offer });
      }
    });

    // Someone else joined after me - wait for their offer, nothing to do yet
    socket.on("user_joined_call", () => {});

    socket.on("webrtc_offer", async ({ from, offer }) => {
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc_answer", { to: from, answer });
    });

    socket.on("webrtc_answer", async ({ from, answer }) => {
      const pc = peersRef.current[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("webrtc_ice_candidate", async ({ from, candidate }) => {
      const pc = peersRef.current[from];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Failed to add ICE candidate:", err);
        }
      }
    });

    socket.on("user_left_call", (socketId) => {
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
      }
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    });

    setup();

    return () => {
      isMounted = false;
      socket.emit("leave_call", id);
      socket.off("call_full");
      socket.off("existing_call_users");
      socket.off("user_joined_call");
      socket.off("webrtc_offer");
      socket.off("webrtc_answer");
      socket.off("webrtc_ice_candidate");
      socket.off("user_left_call");

      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  const toggleCam = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
    }
  };

  const handleLeave = () => {
    navigate(`/groups/${id}/chat`);
  };

  return (
    <div className="call-page">
      <div className="call-grid">
        <div className="video-tile local">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <span className="tile-label">You</span>
        </div>

        {Object.entries(remoteStreams).map(([socketId, stream]) => (
          <RemoteVideo key={socketId} stream={stream} />
        ))}
      </div>

      <div className="call-controls">
        <button onClick={toggleMic} className={micOn ? "" : "off"}>
          {micOn ? "🎤" : "🔇"}
        </button>
        <button onClick={toggleCam} className={camOn ? "" : "off"}>
          {camOn ? "📹" : "🚫"}
        </button>
        <button className="leave-btn" onClick={handleLeave}>
          Leave Call
        </button>
      </div>
    </div>
  );
}

function RemoteVideo({ stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-tile">
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
}

export default GroupCall;