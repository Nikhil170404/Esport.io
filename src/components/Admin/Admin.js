import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGames, addGame, updateGameParticipants, deleteGame } from '../../redux/actions/gameActions';
import './Admin.css'; // Import your CSS file for styling

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { games, isLoading, error } = useSelector((state) => state.game);
  
  const [gameName, setGameName] = useState('');
  const [description, setDescription] = useState('');
  const [entryFee, setEntryFee] = useState(0);
  const [participants, setParticipants] = useState(0);
  const [prizePool, setPrizePool] = useState(0);
  const [image, setImage] = useState(null);
  const [isPaid, setIsPaid] = useState(true); // Added field for paid/free games

  useEffect(() => {
    dispatch(fetchGames());
  }, [dispatch]);

  const handleAddGame = () => {
    const newGame = {
      gameName,
      description,
      entryFee: isPaid ? entryFee : 0, // Set entry fee to 0 if the game is free
      participants,
      prizePool,
      imageUrl: image ? URL.createObjectURL(image) : '' // Use local URL for the image
    };
    dispatch(addGame(newGame));
  };

  const handleDeleteGame = (id) => {
    dispatch(deleteGame(id));
  };

  const handleUpdateParticipants = (gameId) => {
    dispatch(updateGameParticipants(gameId));
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <div className="admin-form">
        <div className="form-group">
          <label>Game Name</label>
          <input 
            type="text" 
            placeholder="Game Name" 
            value={gameName} 
            onChange={(e) => setGameName(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea 
            placeholder="Description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Entry Fee</label>
          <input 
            type="number" 
            placeholder="Entry Fee" 
            value={entryFee} 
            onChange={(e) => setEntryFee(Number(e.target.value))}
            disabled={!isPaid}
          />
        </div>
        <div className="form-group">
          <label>Participants</label>
          <input 
            type="number" 
            placeholder="Participants" 
            value={participants} 
            onChange={(e) => setParticipants(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>Prize Pool</label>
          <input 
            type="number" 
            placeholder="Prize Pool" 
            value={prizePool} 
            onChange={(e) => setPrizePool(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>Game Image</label>
          <input 
            type="file" 
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <div className="form-group">
          <label>Paid/Free</label>
          <select 
            value={isPaid}
            onChange={(e) => setIsPaid(e.target.value === 'true')}
          >
            <option value={true}>Paid</option>
            <option value={false}>Free</option>
          </select>
        </div>
        <button onClick={handleAddGame} className="btn btn-primary">Add Game</button>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="admin-error">{error}</p>}
      <div className="game-list">
        {games.map(game => (
          <div key={game.id} className="game-card">
            {game.imageUrl && <img src={game.imageUrl} alt={game.gameName} className="game-image" />}
            <h2>{game.gameName}</h2>
            <p>{game.description}</p>
            <p>Entry Fee: {game.entryFee === 0 ? 'Free' : `$${game.entryFee}`}</p>
            <p>Participants: {game.participants}</p>
            <p>Prize Pool: ${game.prizePool}</p>
            <div className="game-actions">
              <button onClick={() => handleUpdateParticipants(game.id)} className="btn btn-edit">Update Participants</button>
              <button onClick={() => handleDeleteGame(game.id)} className="btn btn-delete">Delete Game</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
