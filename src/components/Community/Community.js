import React, { useState, useEffect } from 'react';
import { firestore, auth, storage } from '../../firebase'; // Updated import to match firebase.js
import { collection, query, onSnapshot, addDoc, Timestamp, orderBy, doc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore'; // Ensure correct import
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Ensure correct import
import { useAuthState } from 'react-firebase-hooks/auth'; // Ensure correct import
import { v4 as uuidv4 } from 'uuid';
import './Community.css';
import { FaHeart, FaComment, FaStar } from 'react-icons/fa'; // Example icons

const Community = () => {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const postsRef = collection(firestore, 'communityPosts');
    const q = query(postsRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
    });
    return () => unsubscribe();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (newPost.trim() || newImage) {
      setLoading(true);
      let imageUrl = '';
      if (newImage) {
        const imageRef = ref(storage, `communityImages/${uuidv4()}`);
        await uploadBytes(imageRef, newImage);
        imageUrl = await getDownloadURL(imageRef);
      }
      await addDoc(collection(firestore, 'communityPosts'), {
        text: newPost,
        userId: user.uid,
        userName: user.displayName,
        timestamp: Timestamp.now(),
        imageUrl,
        likes: [], // Ensure it's an array
        comments: [], // Ensure it's an array
        kudos: 0
      });
      setNewPost('');
      setNewImage(null);
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    const postRef = doc(firestore, 'communityPosts', postId);
    await updateDoc(postRef, {
      likes: arrayUnion(user.uid)
    });
  };

  const handleDeletePost = async (postId) => {
    const postRef = doc(firestore, 'communityPosts', postId);
    await deleteDoc(postRef);
  };

  const handleImageUpload = (e) => {
    setNewImage(e.target.files[0]);
  };

  return (
    <div className="community">
      <h1>Community Forum</h1>
      <form onSubmit={handlePostSubmit} className="community-post-form">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts..."
        />
        <input type="file" onChange={handleImageUpload} />
        <button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
      <div className="community-posts">
        {posts.map(post => (
          <div key={post.id} className="community-post">
            <h3>{post.userName}</h3>
            {post.imageUrl && <img src={post.imageUrl} alt="Post" />}
            <p>{post.text}</p>
            <small>{new Date(post.timestamp.seconds * 1000).toLocaleString()}</small>
            <div className="community-post-actions">
              <button onClick={() => handleLike(post.id)}>
                <FaHeart /> {post.likes ? post.likes.length : 0}
              </button>
              <button>
                <FaComment /> {post.comments ? Object.keys(post.comments).length : 0}
              </button>
              <button>
                <FaStar /> {post.kudos}
              </button>
              {user && post.userId === user.uid && (
                <button onClick={() => handleDeletePost(post.id)}>Delete</button>
              )}
            </div>
            <div className="community-post-comments">
              {post.comments && Object.values(post.comments).map(comment => (
                <div key={comment.timestamp.seconds} className="community-post-comment">
                  <h4>{comment.userName}</h4>
                  <p>{comment.text}</p>
                  <small>{new Date(comment.timestamp.seconds * 1000).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
