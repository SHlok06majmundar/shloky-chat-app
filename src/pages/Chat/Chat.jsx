import React from "react";
import "./Chat.css";
import Leftsidebar from '../../components/Leftsidebar/Leftsidebar';
import ChatBox from '../../components/ChatBox/ChatBox';
import RightSidebar from '../../components/RightSidebar/RightSidebar';

const Chat = () => {
  return (
    <div className="chat">
      <div className="chat-container">
        <Leftsidebar />
        <ChatBox />
        <RightSidebar />
      </div>
    </div>
  );
};

export default Chat;
