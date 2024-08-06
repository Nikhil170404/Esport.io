import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/actions/authAction';
import { fetchWallet } from '../../redux/actions/walletAction';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import './Profile.css';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
    gameUid: user?.gameUid || '',
  });
  const [file, setFile] = useState(null);

  const fetchUserProfile = useCallback(() => {
    if (user?.uid) {
      const unsubscribe = onSnapshot(doc(firestore, 'users', user.uid), (doc) => {
        setFormData((prev) => ({ ...prev, ...doc.data() }));
      });
      dispatch(fetchWallet());
      return unsubscribe;
    }
  }, [user?.uid, dispatch]);

  useEffect(() => {
    const unsubscribe = fetchUserProfile();
    return () => unsubscribe && unsubscribe();
  }, [fetchUserProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSave = async () => {
    let profileImageUrl = formData.profileImage;

    if (file) {
      try {
        if (profileImageUrl) {
          const oldImageRef = ref(storage, profileImageUrl);
          await deleteObject(oldImageRef);
        }
        const fileRef = ref(storage, `profile-images/${user.uid}/${file.name}`);
        await uploadBytes(fileRef, file);
        profileImageUrl = await getDownloadURL(fileRef);
      } catch (error) {
        console.error("Error handling profile image: ", error);
      }
    }

    dispatch(updateUser(user.uid, { ...formData, profileImage: profileImageUrl }));
    setIsEditing(false);
  };

  if (!user) return <p>Please log in to view your profile.</p>;

  return (
    <div className="profile-container">
      <h2>{formData.name}'s Profile</h2>
      <img src={formData.profileImage || 'default-profile.png'} alt="Profile" className="profile-image" />
      {isEditing ? (
        <div className="profile-edit-form">
          {['name', 'email', 'age', 'bio', 'gameUid'].map((field) => (
            <div key={field}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
              <input
                type={field === 'age' ? 'number' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                disabled={field === 'email'}
              />
            </div>
          ))}
          <label>Profile Image:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <div className="profile-edit-actions">
            <button onClick={handleSave}>Save Changes</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Age:</strong> {formData.age}</p>
          <p><strong>Bio:</strong> {formData.bio}</p>
          <p><strong>Game UID:</strong> {formData.gameUid}</p>
          <p><strong>Wallet Balance:</strong> ₹{balance || 0}</p>
          <button className="edit-button" onClick={() => setIsEditing(true)}>Edit Profile</button>
        </>
      )}
    </div>
  );
};

export default Profile;
