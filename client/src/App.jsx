import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Knowledge from "./pages/Knowledge";
import Questions from "./pages/Questions";
import Groups from "./pages/Groups";
import Profile from "./pages/Profile";
import KnowledgeDetail from "./pages/KnowledgeDetail";
import GroupChat from "./pages/GroupChat";
import GroupCall from "./pages/GroupCall";
import QuestionDetail from "./pages/QuestionDetail";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/questions" element={<Questions />} />
         
          <Route path="/groups" element={<Groups />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/knowledge/:id" element={<KnowledgeDetail />} />
          <Route path="/groups/:id/chat" element={<GroupChat />} />
          <Route path="/groups/:id/call" element={<GroupCall />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;