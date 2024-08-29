import React, { useContext, useState, useEffect } from "react";
import "./Chat.css";
import LeftSideBar from "../../components/LeftSidebar/LeftSideBar";
import ChatBox from "../../components/ChatBox/ChatBox";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import { AppContext } from "../../context/AppContext";

const Chat = () => {
  const { chatData, userData } = useContext(AppContext); // Destructure correctly
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatData && userData) {
      setLoading(false);
    }
  }, [chatData, userData]);

  return (
    <div className="chat">
      {loading ? (
        <span className="loading-text">
          <div className="spinner"></div>
        </span>
      ) : (
        <div className="chat-container">
          <LeftSideBar />
          <ChatBox />
          <RightSidebar />
        </div>
      )}
    </div>
  );
};

export default Chat;
