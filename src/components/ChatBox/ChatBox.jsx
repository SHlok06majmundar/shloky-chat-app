import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import moment from "moment-timezone";
import "./ChatBox.css";
import { db } from "../../config/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";

const ChatBox = () => {
  const { chatUser, userData, messagesData, setMessagesData } = useContext(AppContext);
  const [userStatus, setUserStatus] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (chatUser) {
      const updateStatus = () => {
        if (chatUser.isOnline) {
          setUserStatus("Online");
        } else if (chatUser.lastSeen) {
          const lastSeenDate = chatUser.lastSeen.toDate ? chatUser.lastSeen.toDate() : chatUser.lastSeen;
          const istTime = moment(lastSeenDate).tz("Asia/Kolkata");
          const formattedLastSeen = istTime.isValid() ? istTime.format("DD MMM YYYY, hh:mm A") : "Unknown";
          setUserStatus(`Last seen: ${formattedLastSeen}`);
        } else {
          setUserStatus("Offline");
        }
      };
      updateStatus();
    }
  }, [chatUser]);

  useEffect(() => {
    if (chatUser && userData) {
      const fetchMessages = () => {
        const messagesRef = collection(db, "messages");
        const q = query(
          messagesRef,
          where("senderId", "in", [userData.id, chatUser.id]),
          where("recipientId", "in", [userData.id, chatUser.id])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessagesData(messages.sort((a, b) => a.createdAt - b.createdAt));
        });

        return () => unsubscribe();
      };

      fetchMessages();
    } else {
      setMessagesData([]);
    }
  }, [chatUser, userData, setMessagesData]);

  const handleSendMessage = async () => {
    if (!message.trim() && !image) return;

    try {
      const messagesRef = collection(db, "messages");
      const messageData = {
        senderId: userData.id,
        recipientId: chatUser.id,
        text: message,
        createdAt: serverTimestamp(),
      };

      if (image) {
        messageData.imageUrl = await uploadImage(image);
      }

      await addDoc(messagesRef, messageData);
      const chatDocRef = doc(db, "chats", chatUser.id);
      const chatDocSnapshot = await getDoc(chatDocRef);

      if (!chatDocSnapshot.exists()) {
        await setDoc(chatDocRef, {
          lastMessage: message || "Image sent",
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(chatDocRef, {
          lastMessage: message || "Image sent",
        });
      }

      setMessage("");
      setImage(null);
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error.message);
      toast.error("Error sending message.");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleImageSend = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = handleImageUpload;
    input.click();
  };

  return (
    <div className="chat-box">
      {chatUser ? (
        <>
          <div className="chat-header">
            <div className="chat-user">
              <img src={chatUser.avatar} alt="User Avatar" className="user-avatar" />
              <div>
                <p>{chatUser.name}</p>
                <div className="status-container">
                  <div className={`green-dot ${chatUser.isOnline ? "online" : "offline"}`} />
                  <span className="online-status">{userStatus}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="chat-history">
            {messagesData.map((msg) => (
              <div key={msg.id} className={`message ${msg.senderId === userData.id ? "s-msg" : "r-msg"}`}>
                {msg.senderId !== userData.id && (
                  <img src={chatUser.avatar} alt="Receiver Avatar" className="message-avatar" />
                )}
                <div className={`msg ${msg.senderId === userData.id ? "sent" : "received"}`}>
                  {msg.imageUrl && <img src={msg.imageUrl} alt="Chat Image" className="msg-img" />}
                  {msg.text && <p>{msg.text}</p>}
                  <div className="time-info">
                    {msg.createdAt && moment(msg.createdAt.toDate()).format("hh:mm A")}
                  </div>
                </div>
                {msg.senderId === userData.id && (
                  <img src={userData.avatar} alt="Sender Avatar" className="message-avatar" />
                )}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleImageSend}>📷</button>
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </>
      ) : (
        <div className="chat-placeholder">Select a user to chat with</div>
      )}
    </div>
  );
};

const uploadImage = async (image) => {
  return "image-uploaded-url";
};

export default ChatBox;
