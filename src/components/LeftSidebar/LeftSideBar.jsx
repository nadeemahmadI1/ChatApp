import React, { useContext, useEffect, useState } from "react";
import assets from "../../assets/assets.js";
import "./LeftSideBar.css";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/Firebase.js";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";

const LeftSideBar = () => {
  const navigate = useNavigate();
  const { userData, chatData, chatUser, setChatUser, setMessagesId,messagesId,chatVisible,setChatVisible} =
    useContext(AppContext);
  const [user, setUser] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value.trim().toLowerCase(); // Trim and lower case for consistency
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(
          userRef,
          where("username", ">=", input),
          where("username", "<=", input + "\uf8ff")
        ); // Range query for partial matching
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;
          chatData.map((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExist = true;
            }
          });
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser("");
        }
      } else {
        setShowSearch(false);
        setUser(""); // Reset user when input is cleared
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const addChat = async () => {
    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");
    try {
      const newMessagesRef = doc(messagesRef);
      await setDoc(newMessagesRef, {
        createAt: serverTimestamp(),
        messages: [],
      });
      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messagesId: newMessagesRef.id,
          lastMessage: "",
          rId: userData.id,
          updateAt: Date.now(),
          messageSeen: true,
        }),
      });
      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messagesId: newMessagesRef.id,
          lastMessage: "",
          rId: user.id,
          updateAt: Date.now(),
          messageSeen: true,
        }),
      });
      const uSnap = await getDoc(doc(db, "users", user.id));
      const uData = uSnap.data();
      setChat({
        messagesId: newMessagesRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData:uData
      })
      
      setShowSearch(false);
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  const setChat = async (item) => {
    try {
      // Set the current chat context
      setMessagesId(item.messagesId);
      setChatUser(item);

      // Get the user's chat data from Firestore
      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chatsData.findIndex(
          (c) => c.messagesId === item.messagesId
        );

        if (chatIndex !== -1) {
          userChatsData.chatsData[chatIndex].messageSeen = true; // Mark the message as seen
          await updateDoc(userChatsRef, {
            chatsData: userChatsData.chatsData,
          });
        }
      }
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };
   
  useEffect(() => {
     
    const updateChatUserData = async () => {
      if (chatUser) {
        const userRef = doc(db, "users", chatUser.userData.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setChatUser(prev => ({
          ...prev, userData: userData
        }))
      }
    }
    updateChatUserData();
   },[chatData])

  return (
    <div className={`ls ${chatVisible ? "hidden":""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="" className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="menu" />
            <div className="sub-menu">
              <p
                onClick={() => {
                  navigate("/profileUpdate");
                }}
              >
                Update Profile
              </p>
              <hr />
              <p>Setting</p>
              <hr />
              <p>Blocked</p>
              <hr />
              <p>Privacy</p>
              <hr />
              <p>Help</p>
              <hr />
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search Here..."
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="profile" />
            <p>{user.name}</p>
          </div>
        ) : (
          chatData.map((item, index) => (
            <div
              onClick={() => {
                setChat(item);
              }}
              key={index}
              className={`friends ${item.messageSeen || item.messageId === messagesId ? "": "border"}`}
            >
              <img src={item.userData.avatar} alt="profile" />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSideBar;
