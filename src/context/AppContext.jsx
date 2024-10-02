import React, { createContext, useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    const savedUserData = localStorage.getItem('userData');
    return savedUserData ? JSON.parse(savedUserData) : null;
  });

  const [chatData, setChatData] = useState([]);
  const [messagesData, setMessagesData] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Load user data from Firestore
  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const user = { id: uid, ...userSnap.data() };
        setUserData(user);
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        console.error('No such user found!');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Update user online/offline status
  const updateUserStatus = async (userId, isOnline) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isOnline,
        lastSeen: isOnline ? null : new Date() // Store the current time when offline
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Save user profile changes
  const saveUserProfile = async (userId, profileData) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, profileData);
      const updatedUser = { ...userData, ...profileData };
      setUserData(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Fetch chat data for the user
  const fetchChats = async (uid) => {
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', uid));
      const chatSnap = await getDocs(q);

      const chats = await Promise.all(chatSnap.docs.map(async (chatDoc) => {
        const chatData = { id: chatDoc.id, ...chatDoc.data() };
        chatData.userData = await Promise.all(chatData.participants.map(async (participantId) => {
          const userRef = doc(db, 'users', participantId);
          const userSnap = await getDoc(userRef);
          return userSnap.exists() ? { id: participantId, ...userSnap.data() } : null;
        }));
        return chatData;
      }));

      setChatData(chats.filter(chat => chat.userData));
      console.log('Fetched chats:', chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);
      const usersList = usersSnap.docs.map((userDoc) => ({
        id: userDoc.id,
        ...userDoc.data(),
      }));

      setUsers(usersList);
      console.log('Fetched users:', usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch messages for a specific user
  const fetchMessagesForUser = async (userId) => {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, where('recipientId', '==', userId));
      const messagesSnap = await getDocs(q);

      const messages = messagesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessagesData(messages);
      console.log('Fetched messages for user:', messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // UseEffect to monitor authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadUserData(user.uid);
        updateUserStatus(user.uid, true); // Mark user as online
      } else {
        setUserData(null);
        localStorage.removeItem('userData');
        setChatData([]);
        setMessagesData([]);
      }
    });

    return () => {
      if (userData) {
        updateUserStatus(userData.id, false); // Mark user as offline on sign-out
      }
      unsubscribe();
    };
  }, [userData]);

  // Fetch chats when user data is available
  useEffect(() => {
    if (userData && userData.id) {
      fetchChats(userData.id);
    } else {
      setChatData([]);
    }
  }, [userData]);

  // Fetch all users once when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Context value containing all state and functions
  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    messagesData,
    setMessagesData,
    chatUser,
    setChatUser,
    users,
    loadUserData,
    saveUserProfile,
    fetchChats,
    fetchMessagesForUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
