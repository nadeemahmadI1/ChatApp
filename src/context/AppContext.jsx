import React, { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/Firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserdata] = useState(null);
  const [chatData, setChatdata] = useState(null);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);

  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserdata(data);
        if (data.avatar && data.name) {
          navigate("/chat");
        } else {
          navigate("/profileUpdate");
        }
        await updateDoc(userRef, { lastSeen: new Date() });
      } else {
        console.error("User document does not exist");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };
   const isActive = (lastSeen) => {
     // Check if the user was active within the last 1 minute (60,000 milliseconds)
     return Date.now() - lastSeen.toDate().getTime() <= 60000;
   };

  useEffect(() => {
    if (auth.currentUser) {
      loadUserData(auth.currentUser.uid);
    } else {
      navigate("/");
    }
  }, [auth.currentUser]);

  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, "chats", userData.id);
      const unsub = onSnapshot(chatRef, (res) => {
        const chatItems = res.data()?.chatsData || [];
        const tempData = chatItems.map(async (item) => {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);
          return { ...item, userData: userSnap.data() };
        });
        Promise.all(tempData)
          .then((data) => {
            setChatdata(data.sort((a, b) => b.updateAt - a.updateAt));
          })
          .catch((error) =>
            console.error("Error processing chat data:", error)
          );
      });
      return () => unsub();
    }
  }, [userData]);
   const ConvertTimestamp = (timestamp) => {
     const date = timestamp.toDate();
     const hours = date.getHours();
     let minutes = date.getMinutes();
     minutes = minutes < 10 ? `0${minutes}` : minutes;
     if (hours > 12) {
       return `${hours - 12}:${minutes} PM`;
     } else {
       return `${hours}: ${minutes} AM`;
     }
   };
  const value = {
    userData,
    setUserdata,
    chatData,
    setChatdata,
    loadUserData,
    messagesId,
    setMessagesId,
    messages,
    setMessages,
    chatUser,
    setChatUser,
    isActive,
    ConvertTimestamp,
    chatVisible,
    setChatVisible
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
