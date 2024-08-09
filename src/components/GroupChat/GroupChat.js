import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../firebase';

const GroupChat = ({ groupId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const messagesRef = collection(firestore, 'chats', groupId, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleSendMessage = async () => {
    const messagesRef = collection(firestore, 'chats', groupId, 'messages');
    await addDoc(messagesRef, {
      text: newMessage,
      author: 'User ID or Name',
      createdAt: serverTimestamp(),
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
