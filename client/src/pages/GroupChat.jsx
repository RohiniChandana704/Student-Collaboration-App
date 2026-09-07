import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { connectSocket, getSocket } from "../services/socket";
import "./GroupChat.css";

function GroupChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [inCall, setInCall] = useState(false);

  const messagesEndRef = useRef(null);

  // Load group info + chat history, then connect the socket
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in to access group chat.");
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const groupRes = await api.get(`/groups/${id}`);
        setGroup(groupRes.data);

        const messagesRes = await api.get(`/groups/${id}/messages`);
        setMessages(messagesRes.data);
      } catch (error) {
        console.error("Failed to load chat:", error);
        alert(error.response?.data?.message || "Failed to load group chat");
      }
    };

    load();

    const socket = connectSocket(token);
    socket.emit("join_group", id);

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receive_message");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    const socket = getSocket();
    socket.emit("send_message", { groupId: id, text });
    setText("");
  };

  const roomName = `student-collab-${id}`;

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <button className="back-btn" onClick={() => navigate("/groups")}>
            ← Back
          </button>

          <h2>{group?.name || "Group Chat"}</h2>

          <button className="call-btn" onClick={() => setInCall((prev) => !prev)}>
            {inCall ? "End Call View" : "🎥 Start Call"}
          </button>
        </div>

        <button className="call-btn" onClick={() => navigate(`/groups/${id}/call`)}>
         🎥 Start Call
       </button>

        <div className="messages-list">
          {messages.map((msg) => {
            const isOwn =
              msg.sender?._id === user?.id || msg.sender?._id === user?._id;

            return (
              <div
                className={isOwn ? "message-item own" : "message-item"}
                key={msg._id}
              >
                {!isOwn && <strong>{msg.sender?.name || "Unknown"}</strong>}
                <p>{msg.text}</p>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form className="message-form" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default GroupChat;
