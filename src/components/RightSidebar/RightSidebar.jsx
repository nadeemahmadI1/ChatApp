import React, { useContext, useEffect, useState } from "react";
import "./RightSidebar.css";
import assets from "../../assets/assets.js";
import { logout } from "../../config/Firebase.js";
import { AppContext } from "../../context/AppContext.jsx";

const RightSidebar = () => {
  const { chatUser, messages, isActive, ConvertTimestamp} =
    useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let tempVar = [];
    messages.forEach((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar);
  }, [messages]);

  return chatUser ? (
    <div className="rs">
      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="" />
        <h3>{chatUser.userData.name}</h3>
        <p>
          {isActive(chatUser.userData.lastSeen) ? (
            <img className="dot" src={assets.green_dot} alt="active" />
          ) : (
            <span className="lastseen">
              {ConvertTimestamp(chatUser.userData.lastSeen)}
            </span>
          )}
        </p>

        <p>{chatUser.userData.bio || " "}</p>
      </div>
      <hr />
      <div className="rs-media">
        <h3>Media</h3>
        {selectedImage ? (
          <div className="image-viewer" onClick={() => setSelectedImage(null)}>
            <img src={selectedImage} alt="Selected" />
          </div>
        ) : (
          <div className="image-grid">
            {msgImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        )}
      </div>
      <button className="rs-btn" onClick={() => logout()}>
        Logout
      </button>
    </div>
  ) : (
    <div className="rs">
      <button className="rs-btn" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
