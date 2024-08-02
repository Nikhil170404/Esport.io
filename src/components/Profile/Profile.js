import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/actions/authAction';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import './Profile.css';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = onSnapshot(doc(firestore, 'users', user.uid), (doc) => {
        const data = doc.data();
        setFormData({
          name: data.name,
          email: data.email,
          age: data.age,
          bio: data.bio,
          profileImage: data.profileImage
        });
      });

      return () => unsubscribe();
    }
  }, [user?.uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSave = async () => {
    let profileImageUrl = formData.profileImage;

    if (file) {
      // Delete the previous profile image from Firebase Storage
      if (profileImageUrl) {
        const oldImageRef = ref(storage, profileImageUrl);
        await deleteObject(oldImageRef).catch((error) => {
          console.error("Error deleting old profile image: ", error);
        });
      }

      // Upload the new profile image
      const fileRef = ref(storage, `profile-images/${user.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
      profileImageUrl = await getDownloadURL(fileRef);
    }

    // Update the user's profile data in Firestore
    dispatch(updateUser(user.uid, { ...formData, profileImage: profileImageUrl }));
    setIsEditing(false);
  };

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="profile-container">
      <h2>{formData.name}'s Profile</h2>
      <img src={formData.profileImage || 'default-profile.png'} alt="Profile" className="profile-image" />
      {isEditing ? (
        <div className="profile-edit-form">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled
          />
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
          <label>Bio:</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />
          <label>Profile Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button onClick={handleSave}>Save Changes</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Age:</strong> {formData.age}</p>
          <p><strong>Bio:</strong> {formData.bio}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </>
      )}
    </div>
  );
};

export default Profile;
