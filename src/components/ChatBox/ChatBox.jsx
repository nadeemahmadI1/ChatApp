import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets.js";
import { AppContext } from "../../context/AppContext.jsx";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/Firebase.js";
import { toast } from "react-toastify";
import { upload } from "../../lib/upload.js";

const ChatBox = () => {
  const {
    isActive,
    chatUser,
    userData,
    messagesId,
    messages,
    setMessages,
    ConvertTimestamp,
    chatVisible,
    setChatVisible
  } = useContext(AppContext);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
     const updateLastSeen = async () => {
       try {
         const userRef = doc(db, "users", userData.id);
         await updateDoc(userRef, { lastSeen: new Date() });
       } catch (error) {
         console.error("Error updating last seen:", error);
       }
     };

     updateLastSeen();
  }, [messagesId]);

  const sendMessage = async () => {
    try {
      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion({
          text: input,
          sId: userData.id,
          createdAt: new Date(),
        }),
      });

      const userIDs = [chatUser.rId, userData.id];

      userIDs.forEach(async (id) => {
        const userChatRef = doc(db, "chats", id);
        const userChatSnapshot = await getDoc(userChatRef);
        if (userChatSnapshot.exists()) {
          const userChatData = userChatSnapshot.data();
          const chatIndex = userChatData.chatsData.findIndex(
            (c) => c.messagesId === messagesId
          );
          if (chatIndex !== -1) {
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 20);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatRef, {
              chatsData: userChatData.chatsData,
            });
          }
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setInput("");
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);
      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            image: fileUrl,
            sId: userData.id,
            createdAt: new Date(),
          }),
        });
        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatRef = doc(db, "chats", id);
          const userChatSnapshot = await getDoc(userChatRef);
          if (userChatSnapshot.exists()) {
            const userChatData = userChatSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messagesId === messagesId
            );
            if (chatIndex !== -1) {
              userChatData.chatsData[chatIndex].lastMessage = "image";
              userChatData.chatsData[chatIndex].updatedAt = Date.now();
              if (userChatData.chatsData[chatIndex].rId === userData.id) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }
              await updateDoc(userChatRef, {
                chatsData: userChatData.chatsData,
              });
            }
          }
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

 
   
  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img
          className="profile-pic"
          src={chatUser.userData.avatar}
          alt="profile"
        />
        <p>
          {chatUser.userData.name}
          {isActive(chatUser.userData.lastSeen) ? (
            <span>Active..</span>
          ) : (
            <span className="lastseen">
              {ConvertTimestamp(chatUser.userData.lastSeen)}
            </span>
          )}
        </p>
        <img className="help_icon" src={assets.help_icon} alt="help_icon" />
        <img
          onClick={() => {
            setChatVisible(false);
          }}
          src={assets.arrow_icon}
          className="arrow"
          alt=""
        />
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => {
          return (
            <div
              key={index}
              className={msg.sId === userData.id ? "s-msg" : "r-msg"}
            >
              {msg["image"] ? (
                <img className="msg-img" src={msg.image} alt="image" />
              ) : (
                <p className="msg">{msg.text}</p>
              )}
              <div>
                <img
                  src={
                    msg.sId === userData.id
                      ? userData.avatar
                      : chatUser.userData.avatar
                  }
                  alt=""
                />
                <p>{ConvertTimestamp(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Type a message"
        />
        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png,image/jpeg"
          hidden
        />
        <label htmlFor="image">
          <img className="gallery-icon" src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>
        Welcome {userData.name}
        <br />
        Chat Anytime, Anywhere
      </p>
    </div>
  );
};

export default ChatBox;
