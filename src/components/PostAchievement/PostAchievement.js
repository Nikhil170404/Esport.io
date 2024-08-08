// src/components/PostAchievement.js
import React, { useState } from 'react';
import { firestore, storage } from '../../firebase';

const PostAchievement = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    setLoading(true);
    let mediaUrl = '';
    if (image) {
      const imageRef = storage.ref(`achievements/${image.name}`);
      await imageRef.put(image);
      mediaUrl = await imageRef.getDownloadURL();
    }

    await firestore.collection('posts').add({
      title,
      content,
      author: 'User ID or Name',
      createdAt: new Date(),
      mediaUrl,
    });

    setLoading(false);
    setTitle('');
    setContent('');
    setImage(null);
  };

  return (
    <div className="post-achievement">
      <h2>Post Achievement</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <button onClick={handlePost} disabled={loading}>
        {loading ? 'Posting...' : 'Post Achievement'}
      </button>
    </div>
  );
};

export default PostAchievement;
