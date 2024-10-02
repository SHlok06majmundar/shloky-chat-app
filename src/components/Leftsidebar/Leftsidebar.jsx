import React, { useContext, useState, useEffect } from "react";
import assets from "../../assets/assets";
import "./Leftsidebar.css";
import { useNavigate } from "react-router-dom";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const Leftsidebar = () => {
  const navigate = useNavigate();
  const {
    userData,
    chatData,
    fetchChats,
    setChatUser,
    setMessagesData,
    fetchMessagesForUser,
  } = useContext(AppContext);
  
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedChats, setSelectedChats] = useState(new Set());
  const [lastMessages, setLastMessages] = useState({}); // Store last messages
  const [userNotFound, setUserNotFound] = useState(false); // State for no user found

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        setUserNotFound(false); // Reset no user found state
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          const searchedUser = querySnap.docs[0].data();
          setUser(searchedUser);
        } else {
          setUser(null);
          setUserNotFound(true); // Set no user found state
        }
      } else {
        setShowSearch(false);
        setUser(null);
        setUserNotFound(false); // Reset no user found state
      }
    } catch (error) {
      toast.error("Error searching user.");
    }
  };

  const addChat = async () => {
    if (!user) return;

    const chatsRef = collection(db, "chats");
    const existingChat = chatData.find((chat) =>
      chat.participants.includes(user.id)
    );

    if (existingChat) {
      toast.info("Chat with this user already exists.");
      return;
    }

    try {
      const newChatRef = doc(chatsRef);
      await setDoc(newChatRef, {
        participants: [userData.id, user.id],
        lastMessage: "",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "users", userData.id), {
        chatData: arrayUnion(newChatRef.id),
      });

      await updateDoc(doc(db, "users", user.id), {
        chatData: arrayUnion(newChatRef.id),
      });

      await fetchChats(userData.id);
      toast.success("Chat added successfully!");
      setUser(null);
      setShowSearch(false);
    } catch (error) {
      toast.error("Error adding chat.");
      console.error("Error adding chat:", error);
    }
  };

  const fetchLastMessage = async (chatId) => {
    try {
      const chatDoc = await getDoc(doc(db, "chats", chatId));
      return chatDoc.exists() ? chatDoc.data().lastMessage : "";
    } catch (error) {
      console.error("Error fetching last message:", error);
      return "";
    }
  };

  const setChat = async (item) => {
    const otherParticipant = item.userData.find(
      (participant) => participant.id !== userData.id
    );
    setChatUser(otherParticipant);

    try {
      const messages = await fetchMessagesForUser(otherParticipant.id);
      setMessagesData(messages);
    } catch (error) {
      console.error("Error fetching messages for user:", error);
    }
  };

  const handleSelectChat = (chatId) => {
    const updatedSelectedChats = new Set(selectedChats);
    if (updatedSelectedChats.has(chatId)) {
      updatedSelectedChats.delete(chatId);
    } else {
      updatedSelectedChats.add(chatId);
    }
    setSelectedChats(updatedSelectedChats);
  };

  const deleteChats = async () => {
    try {
      const chatsToDelete = Array.from(selectedChats);
      for (const chatId of chatsToDelete) {
        await deleteDoc(doc(db, "chats", chatId));
        await updateDoc(doc(db, "users", userData.id), {
          chatData: arrayRemove(chatId),
        });
      }
      toast.success("Selected chats deleted successfully!");
      setSelectedChats(new Set());
      fetchChats(userData.id);
    } catch (error) {
      toast.error("Error deleting chats.");
      console.error("Error deleting chats:", error);
    }
  };

  // Fetch last messages for all chats
  useEffect(() => {
    const fetchAllLastMessages = async () => {
      const lastMessagesObj = {};
      for (const chat of chatData) {
        const lastMessage = await fetchLastMessage(chat.id);
        lastMessagesObj[chat.id] = lastMessage;
      }
      setLastMessages(lastMessagesObj);
    };
    
    fetchAllLastMessages();
  }, [chatData]); // Run when chatData changes

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="" className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p onClick={deleteChats} style={{ color: "red" }}>
                Delete Selected Chats
              </p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input onChange={inputHandler} type="text" placeholder="Search here.." />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar || assets.defaultAvatar} alt="User Avatar" />
            <p>{user.name || user.username}</p>
          </div>
        ) : (
          userNotFound ? (
            <div className="no-user-found">
              <p>No user found.</p>
            </div>
          ) : (
            chatData.map((item, index) => {
              const participant =
                item.userData.find(
                  (participant) => participant.id !== userData.id
                ) || {};
              const avatar = participant.avatar || assets.defaultAvatar;
              const name = participant.name || participant.username || "User Name";
              const lastMessage = lastMessages[item.id] || "Loading...";

              return (
                <div key={index} className="friends" onClick={() => setChat(item)}>
                  <input
                    type="checkbox"
                    checked={selectedChats.has(item.id)}
                    onChange={() => handleSelectChat(item.id)}
                  />
                  <img src={avatar} alt="User Avatar" />
                  <div className="chat-info">
                    <p>{name}</p>
                    <p className="last-message">{lastMessage || "No messages yet"}</p>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};

export default Leftsidebar;
