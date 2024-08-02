import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addGame, fetchGames, updateGame, deleteGame } from '../../redux/actions/gameActions';
import { doc, deleteDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, firestore } from '../../firebase';
import './Admin.css';  // Ensure this CSS file is optimized for responsiveness

const Admin = () => {
  const [gameData, setGameData] = useState({
    title: '',
    description: '',
    gameName: '',
    participants: 0,
    entryFee: 0,
    prizeMoney: 0,
    roomId: '',
    roomPassword: '',
    paid: true,
    imageUrl: '',
  });
  const [selectedGame, setSelectedGame] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const gamesPerPage = 10;

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const games = useSelector((state) => state.game.games) || [];

  useEffect(() => {
    dispatch(fetchGames());
  }, [dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) { // Limit file size to 5MB
      setImageFile(file);
    } else {
      alert("File size exceeds 5MB");
    }
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setGameData({
      ...gameData,
      [id]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = gameData.imageUrl;
  
      if (imageFile) {
        const imageRef = ref(storage, `game-images/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }
  
      const updatedGameData = { ...gameData, imageUrl };
  
      if (editMode && selectedGame) {
        const gameRef = doc(firestore, 'games', selectedGame.id);
        await updateDoc(gameRef, updatedGameData);
        dispatch(updateGame(selectedGame.id, updatedGameData));
      } else {
        const newGameRef = await addDoc(collection(firestore, 'games'), updatedGameData);
        dispatch(addGame({ id: newGameRef.id, ...updatedGameData }));
      }
  
      resetForm();
    } catch (error) {
      console.error("Error saving game data: ", error);
      alert("Failed to save game data. Please check your permissions and try again.");
    }
  };
  
  
  const handleEdit = (game) => {
    setSelectedGame(game);
    setGameData({
      title: game.title || '',
      description: game.description || '',
      gameName: game.gameName || '',
      participants: game.participants || 0,
      entryFee: game.entryFee || 0,
      prizeMoney: game.prizeMoney || 0,
      roomId: game.roomId || '',
      roomPassword: game.roomPassword || '',
      paid: game.paid || true,
      imageUrl: game.imageUrl || '',
    });
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        const gameRef = doc(firestore, 'games', id);
        await deleteDoc(gameRef);
        dispatch(deleteGame(id));
      } catch (error) {
        console.error("Error deleting game: ", error);
      }
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const resetForm = () => {
    setGameData({
      title: '',
      description: '',
      gameName: '',
      participants: 0,
      entryFee: 0,
      prizeMoney: 0,
      roomId: '',
      roomPassword: '',
      paid: true,
      imageUrl: '',
    });
    setImageFile(null);
    setEditMode(false);
    setSelectedGame(null);
  };

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);

  const totalPages = Math.ceil(games.length / gamesPerPage);

  if (!user || !user.isAdmin) {
    return <p className="admin-error">You need to be logged in as an admin to access this page.</p>;
  }

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        {[
          { id: 'title', label: 'Title:', type: 'text' },
          { id: 'description', label: 'Description:', type: 'textarea' },
          { id: 'gameName', label: 'Game Name:', type: 'text' },
          { id: 'participants', label: 'Participants:', type: 'number' },
          { id: 'entryFee', label: 'Entry Fee:', type: 'number' },
          { id: 'prizeMoney', label: 'Prize Money:', type: 'number' },
          { id: 'roomId', label: 'Room ID:', type: 'text' },
          { id: 'roomPassword', label: 'Room Password:', type: 'text' },
        ].map(({ id, label, type }) => (
          <div key={id} className="form-group">
            <label htmlFor={id}>{label}</label>
            {type === 'textarea' ? (
              <textarea
                id={id}
                value={gameData[id]}
                onChange={handleInputChange}
                required
              />
            ) : (
              <input
                id={id}
                type={type}
                value={gameData[id]}
                onChange={handleInputChange}
                required
              />
            )}
          </div>
        ))}
        <div className="form-group">
          <label htmlFor="paid">
            <input
              id="paid"
              type="checkbox"
              checked={gameData.paid}
              onChange={handleInputChange}
            />
            Paid
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="image">Game Image:</label>
          <input id="image" type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="form-actions">
          <button type="submit" className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}>
            {editMode ? 'Update Game' : 'Add Game'}
          </button>
          {editMode && (
            <button type="button" className="btn btn-cancel" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="game-list">
        {currentGames.map((game) => (
          <div key={game.id} className="game-card">
            {game.imageUrl && <img src={game.imageUrl} alt={game.title} className="game-image" />}
            <h2>{game.title}</h2>
            <p>{game.description}</p>
            <p><strong>Game Name:</strong> {game.gameName}</p>
            <p><strong>Participants:</strong> {game.participants}</p>
            <p><strong>Entry Fee:</strong> ${game.entryFee}</p>
            <p><strong>Prize Money:</strong> ${game.prizeMoney}</p>
            <p><strong>Room ID:</strong> {game.roomId}</p>
            <p><strong>Room Password:</strong> {game.roomPassword}</p>
            <div className="game-actions">
              <button className="btn btn-edit" onClick={() => handleEdit(game)}>
                Edit
              </button>
              <button className="btn btn-delete" onClick={() => handleDelete(game.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Admin;
