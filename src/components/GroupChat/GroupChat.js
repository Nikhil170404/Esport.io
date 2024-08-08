// src/components/GroupChat.js
import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';

const GroupChat = ({ groupId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const unsubscribe = firestore.collection('chats').doc(groupId).collection('messages')
      .orderBy('createdAt')
      .onSnapshot(snapshot => {
        setMessages(snapshot.docs.map(doc => doc.data()));
      });

    return () => unsubscribe();
  }, [groupId]);

  const handleSendMessage = async () => {
    await firestore.collection('chats').doc(groupId).collection('messages').add({
      text: newMessage,
      author: 'User ID or Name',
      createdAt: new Date(),
    });
    setNewMessage('');
  };

  return (
    <div className="group-chat">
      <h2>Group Chat</h2>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="chat-message">
            <strong>{msg.author}: </strong>{msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default GroupChat;
