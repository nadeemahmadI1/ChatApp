import React, { useContext, useEffect, useState } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/Firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { upload } from "../../lib/upload.js";
import { AppContext } from "../../context/AppContext.jsx";

const ProfileUpdate = () => {
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUserdata } = useContext(AppContext);
  const navigate = useNavigate();

  const profileUpdate = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!prevImage && !image) {
        toast("Upload Profile Pic");
        return;
      }
      const docRef = doc(db, "users", uid);
      // let imageUrl = prevImage;
      if (image) {
        const imageUrl = await upload(image);
        setPrevImage(imageUrl);
        await updateDoc(docRef, {
          avatar: imageUrl,
          bio: bio,
          name: name,
        });
        // toast("profile updated Successfully");
      } else {
        await updateDoc(docRef, {
          bio: bio,
          name: name,
        });
      }
      const snap = await getDoc(docRef);
      setUserdata(snap.data());
      navigate("/chat");
    } catch (error) {
      toast.error("Failed to updating profile.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.data().name) {
          setName(docSnap.data().name);
        }
        if (docSnap.data().bio) {
          setBio(docSnap.data().bio);
        }
        if (docSnap.data().avatar) {
          setPrevImage(docSnap.data().avatar);
        }
      } else {
        navigate("/");
      }
    });
  }, []);

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              type="file"
              id="avatar"
              onChange={(e) => {
                setImage(e.target.files[0]);
              }}
              accept=".png, .jpg, .jpeg"
              hidden
            ></input>
            <img
              src={
                image
                  ? URL.createObjectURL(image)
                  : prevImage
                  ? prevImage
                  : assets.avatar_icon
              }
              alt=""
            />
            <p>Upload Profile</p>
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Enter Name..."
          />
          <textarea
            onChange={(e) => {
              setBio(e.target.value);
            }}
            value={bio}
            placeholder="Write Bio..."
          ></textarea>
          <button type="submit" disabled={loading}>
            {loading ? (
              <span className="loading-text">
                <div className="spinner"></div>
              </span>
            ) : (
              "Save"
            )}
          </button>
        </form>
        <img
          className="profile-pic"
          src={
            image
              ? URL.createObjectURL(image)
              : prevImage
              ? prevImage
              : assets.avatar_icon
          }
          alt=""
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
