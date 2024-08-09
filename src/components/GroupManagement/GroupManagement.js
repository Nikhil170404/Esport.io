import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { app } from '../../firebase';
import { useAuth } from '../../hooks/useAuth'; // Custom hook for authentication
import EmojiPicker from 'emoji-picker-react';
import './GroupManagement.css'; // Import your CSS file for styling

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [emojisVisible, setEmojisVisible] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameSpecificChat, setGameSpecificChat] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);

  const { user } = useAuth();
  const firestore = getFirestore(app);
  const chatEndRef = useRef(null);

  // Fetch groups and listen for typing indicators
  useEffect(() => {
    const groupCollectionRef = collection(firestore, 'groups');
    const unsubscribe = onSnapshot(groupCollectionRef, (snapshot) => {
      const fetchedGroups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(fetchedGroups);

      // Update selected group members and details if a group is selected
      if (selectedGroup) {
        const selectedGroupData = fetchedGroups.find(group => group.id === selectedGroup);
        setGroupMembers(selectedGroupData?.members || []);
        setLeaderboard(selectedGroupData?.leaderboard || []);
        setGameSpecificChat(selectedGroupData?.gameSpecificChat || {});
        setAchievements(selectedGroupData?.achievements || []);
      }
    });

    return () => unsubscribe();
  }, [firestore, selectedGroup]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedGroup, groups]);

  // Create a new group
  const handleCreateGroup = async () => {
    if (groupName.trim() && groupDescription.trim()) {
      const groupCollectionRef = collection(firestore, 'groups');
      const newGroup = await addDoc(groupCollectionRef, {
        name: groupName,
        description: groupDescription,
        image: groupImage,
        members: [user.uid],
        chat: [],
        typingUsers: {},
        leaderboard: [],
        gameSpecificChat: {},
        achievements: {},
      });
      setGroupName('');
      setGroupDescription('');
      setGroupImage(null);
      setCreatingGroup(false);
      setSelectedGroup(newGroup.id);
    }
  };

  // Join an existing group
  const handleJoinGroup = async (groupId) => {
    const groupDocRef = doc(firestore, 'groups', groupId);
    await updateDoc(groupDocRef, {
      members: arrayUnion(user.uid),
    });
    setSelectedGroup(groupId);
  };

  // Send a chat message
  const handleSendMessage = async () => {
    if (selectedGroup && chatMessage.trim()) {
      const groupDocRef = doc(firestore, 'groups', selectedGroup);
      await updateDoc(groupDocRef, {
        chat: arrayUnion({
          sender: user.uid,
          message: chatMessage,
          timestamp: new Date(),
        }),
      });
      setChatMessage('');
      await updateDoc(groupDocRef, {
        typingUsers: {},
      });
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setChatMessage((prevMessage) => prevMessage + emoji.emoji);
  };

  // Handle typing indicator
  const handleTyping = async () => {
    if (selectedGroup) {
      const groupDocRef = doc(firestore, 'groups', selectedGroup);
      await updateDoc(groupDocRef, {
        typingUsers: {
          ...typingUsers,
          [user.uid]: true,
        },
      });
    }
  };

  // Handle emoji picker visibility
  const toggleEmojiPicker = () => setEmojisVisible(!emojisVisible);

  return (
    <div className="group-management">
      <h2>Manage Gaming Groups</h2>

      {/* Toggle Create Group Form */}
      <button
        className="create-group-toggle"
        onClick={() => setCreatingGroup(!creatingGroup)}
      >
        {creatingGroup ? 'Cancel' : 'Create Group'}
      </button>

      {/* Group creation section */}
      {creatingGroup && (
        <div className="create-group">
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
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setGroupImage(URL.createObjectURL(e.target.files[0]))}
          />
          {groupImage && (
            <img src={groupImage} alt="Group Preview" className="group-image-preview" />
          )}
          <button onClick={handleCreateGroup}>Create Group</button>
        </div>
      )}

      {/* Group search section */}
      <input
        type="text"
        placeholder="Search Groups..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="group-search"
      />

      {/* Group listing section */}
      <div className="group-list">
        <h3>Available Gaming Groups</h3>
        {groups
          .filter((group) =>
            group.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((group) => (
            <div key={group.id} className="group-item">
              <img src={group.image} alt={group.name} className="group-image" />
              <div className="group-info">
                <strong>{group.name}</strong>
                <p>{group.description}</p>
                {group.members.includes(user.uid) ? (
                  <button onClick={() => setSelectedGroup(group.id)}>
                    Enter Group
                  </button>
                ) : (
                  <button onClick={() => handleJoinGroup(group.id)}>
                    Join Group
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Chat section for the selected group */}
      {selectedGroup && (
        <div className="group-chat">
          <h3>Group Chat</h3>
          <div className="chat-messages">
            {groups
              .find((group) => group.id === selectedGroup)
              ?.chat.map((chat, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    chat.sender === user.uid ? 'self' : ''
                  }`}
                >
                  <span>{chat.sender === user.uid ? 'You' : chat.sender}:</span>{' '}
                  {chat.message}
                </div>
              ))}
            <div ref={chatEndRef}></div>
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={handleTyping}
            />
            <button onClick={handleSendMessage}>Send</button>
            <button onClick={toggleEmojiPicker} className="emoji-button">
              😊
            </button>
            {emojisVisible && (
              <div className="emoji-picker">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Group Member List */}
      {selectedGroup && (
        <div className="group-members">
          <h3>Group Members</h3>
          <ul>
            {groupMembers.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Leaderboard */}
      {selectedGroup && leaderboard.length > 0 && (
        <div className="group-leaderboard">
          <h3>Leaderboard</h3>
          <ul>
            {leaderboard.map((entry, index) => (
              <li key={index}>
                {entry.user}: {entry.points} points
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Game-Specific Chat */}
      {selectedGroup && Object.keys(gameSpecificChat).length > 0 && (
        <div className="group-game-chat">
          <h3>Game-Specific Chats</h3>
          {Object.keys(gameSpecificChat).map((game) => (
            <div key={game}>
              <h4>{game}</h4>
              <div className="chat-messages">
                {gameSpecificChat[game].map((chat, index) => (
                  <div
                    key={index}
                    className={`chat-message ${
                      chat.sender === user.uid ? 'self' : ''
                    }`}
                  >
                    <span>{chat.sender === user.uid ? 'You' : chat.sender}:</span>{' '}
                    {chat.message}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {selectedGroup && achievements.length > 0 && (
        <div className="group-achievements">
          <h3>Group Achievements</h3>
          <ul>
            {achievements.map((achievement, index) => (
              <li key={index}>
                <strong>{achievement.title}:</strong> {achievement.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GroupManagement;
