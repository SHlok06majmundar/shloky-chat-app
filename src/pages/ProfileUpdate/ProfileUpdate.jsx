import React, { useEffect, useState, useContext } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../config/firebase";
import uploadImage from "../../lib/uploadImage";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const { userData, saveUserProfile, loadUserData } = useContext(AppContext);
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [prevImage, setPrevImage] = useState("");

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setBio(userData.bio || "");
      setPrevImage(userData.avatar || assets.avatar_icon);
    } else {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          loadUserData(user.uid);
        } else {
          navigate("/");
        }
      });

      return () => unsubscribe();
    }
  }, [userData, loadUserData, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!userData || !userData.id) {
      console.error("User data is not available:", userData);
      alert("User data is not available.");
      return;
    }

    try {
      let avatarURL = prevImage;

      if (image) {
        avatarURL = await uploadImage(image);
      }

      await saveUserProfile(userData.id, {
        name,
        bio,
        avatar: avatarURL,
      });

      alert("Profile updated successfully!");
      navigate("/chat");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={handleSave}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar" className="avatar-label">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : prevImage}
              alt="Avatar"
              className="avatar-icon"
            />
            <span>Upload Profile Image</span>
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your Name"
            required
            className="input-field"
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write your bio"
            required
            className="textarea-field"
          />
          <button type="submit" className="submit-button">
            Save
          </button>
        </form>
        <img
          className="profile-pic"
          src={image ? URL.createObjectURL(image) : prevImage}
          alt="Profile Pic"
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
