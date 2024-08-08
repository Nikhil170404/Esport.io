import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, addDoc } from 'firebase/firestore';
import { app } from '../../firebase'; // Ensure you import your initialized Firebase app

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const firestore = getFirestore(app); // Initialize Firestore with your Firebase app

  useEffect(() => {
    const groupCollectionRef = collection(firestore, 'groups');

    const unsubscribe = onSnapshot(groupCollectionRef, (snapshot) => {
      setGroups(snapshot.docs.map((doc) => doc.data()));
    });

    // Cleanup on component unmount
    return () => unsubscribe();
  }, [firestore]);

  const handleCreateGroup = async () => {
    const groupCollectionRef = collection(firestore, 'groups');

    await addDoc(groupCollectionRef, {
      name: groupName,
      description: groupDescription,
      members: [], // Initialize with no members
    });

    setGroupName('');
    setGroupDescription('');
  };

  return (
    <div className="group-management">
      <h2>Manage Groups</h2>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <textarea
        placeholder="Group Description"
        value={groupDescription}
        onChange={(e) => setGroupDescription(e.target.value)}
      />
      <button onClick={handleCreateGroup}>Create Group</button>
      <div className="group-list">
        <h3>Available Groups</h3>
        {groups.map((group, idx) => (
          <div key={idx} className="group-item">
            <strong>{group.name}</strong>
            <p>{group.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupManagement;
