import React, { useContext, useState, useEffect } from 'react';
import './RightSidebar.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const RightSidebar = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);
  const [mediaFiles, setMediaFiles] = useState([]);

  // Load media from localStorage when the component mounts
  useEffect(() => {
    const savedMedia = JSON.parse(localStorage.getItem('mediaFiles')) || [];
    setMediaFiles(savedMedia);
  }, []);

  // Save media to localStorage when mediaFiles state changes
  useEffect(() => {
    localStorage.setItem('mediaFiles', JSON.stringify(mediaFiles));
  }, [mediaFiles]);

  const handleLogout = async () => {
    try {
      navigate('/');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMediaFiles = files.map(file => URL.createObjectURL(file));
    setMediaFiles(prevFiles => [...prevFiles, ...newMediaFiles]);
  };

  const handleDelete = (index) => {
    const confirmed = window.confirm("Are you sure you want to delete this media?");
    if (confirmed) {
      setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    }
  };

  return (
    <div className='rs'>
      <div className="rs-profile">
        <div className="rs-profile-image">
          <img src={userData?.avatar || assets.profile_img} alt="Profile" />
        </div>
        <div className="rs-profile-info">
          <h3>
            {userData?.name || "User"} 
            <img src={assets.green_dot} className='dot' alt="Online status" />
          </h3>
          <p>{userData?.bio || "Hey, I am using this app"}</p>
        </div>
      </div>
      <hr />
      <div className="rs-media">
        <p>Upload Media</p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleMediaUpload}
          className="rs-media-upload"
        />
        <div className="rs-media-grid">
          {mediaFiles.map((file, index) => (
            <div key={index} className="rs-media-item">
              <img src={file} alt={`uploaded media ${index + 1}`} />
              <button onClick={() => handleDelete(index)} className="delete-button">Delete</button>
            </div>
          ))}
        </div>
      </div>
      <button className='rs-button' onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default RightSidebar;
