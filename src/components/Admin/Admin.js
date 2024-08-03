import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGames, addGame, updateGame, deleteGame } from '../../redux/actions/gameActions';
import './Admin.css'; // Import your CSS file for styling
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import Modal from 'react-modal'; // Install react-modal if not already done

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { games, isLoading, error } = useSelector((state) => state.game);

  const [title, setTitle] = useState('');
  const [gameName, setGameName] = useState('');
  const [description, setDescription] = useState('');
  const [entryFee, setEntryFee] = useState(0);
  const [participants, setParticipants] = useState(0);
  const [prizePool, setPrizePool] = useState(0);
  const [image, setImage] = useState(null);
  const [isPaid, setIsPaid] = useState(true);
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [currentGameId, setCurrentGameId] = useState(null);
  const [participantsData, setParticipantsData] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchGames());
  }, [dispatch]);

  useEffect(() => {
    const fetchParticipantsData = async () => {
      const newParticipantsData = {};
      for (const game of games) {
        const gameRef = doc(firestore, 'games', game.id);
        const gameDoc = await getDoc(gameRef);
        const gameData = gameDoc.data();
        if (gameData && gameData.participantsData) {
          newParticipantsData[game.id] = gameData.participantsData;
        }
      }
      setParticipantsData(newParticipantsData);
    };

    fetchParticipantsData();
  }, [games]);

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(URL.createObjectURL(image));
      }
    };
  }, [image]);

  const handleAddGame = () => {
    const newGame = {
      title,
      gameName,
      description,
      entryFee: isPaid ? entryFee : 0,
      participants,
      prizePool,
      imageUrl: image ? URL.createObjectURL(image) : '',
      roomId,
      roomPassword
    };
    dispatch(addGame(newGame));
  };

  const handleDeleteGame = (id) => {
    dispatch(deleteGame(id));
  };

  const handleUpdateGame = () => {
    const updatedGame = {
      id: currentGameId,
      title,
      gameName,
      description,
      entryFee: isPaid ? entryFee : 0,
      participants,
      prizePool,
      imageUrl: image ? URL.createObjectURL(image) : '',
      roomId,
      roomPassword
    };
    dispatch(updateGame(updatedGame));
  };

  const handleEditGame = (game) => {
    setTitle(game.title);
    setGameName(game.gameName);
    setDescription(game.description);
    setEntryFee(game.entryFee);
    setParticipants(game.participants);
    setPrizePool(game.prizePool);
    setImage(game.imageUrl ? new Blob([game.imageUrl]) : null);
    setIsPaid(game.entryFee > 0);
    setRoomId(game.roomId || '');
    setRoomPassword(game.roomPassword || '');
    setCurrentGameId(game.id);
  };

  const openParticipantsModal = (gameId) => {
    setSelectedParticipants(participantsData[gameId] || []);
    setModalIsOpen(true);
  };

  const closeParticipantsModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <div className="admin-form">
        {/* Form for adding/updating games */}
        <div className="form-group">
          <label>Title</label>
          <input 
            type="text" 
            placeholder="Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
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
            value={isPaid.toString()} 
            onChange={(e) => setIsPaid(e.target.value === 'true')} 
          >
            <option value="true">Paid</option>
            <option value="false">Free</option>
          </select>
        </div>
        <div className="form-group">
          <label>Room ID</label>
          <input 
            type="text" 
            placeholder="Room ID" 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Room Password</label>
          <input 
            type="text" 
            placeholder="Room Password" 
            value={roomPassword} 
            onChange={(e) => setRoomPassword(e.target.value)}
          />
        </div>
        <button 
          onClick={currentGameId ? handleUpdateGame : handleAddGame} 
          className="btn btn-primary"
        >
          {currentGameId ? 'Update Game' : 'Add Game'}
        </button>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="admin-error">{error}</p>}
      <div className="game-list">
        {games.map(game => (
          <div key={game.id} className="game-card">
            {game.imageUrl && <img src={game.imageUrl} alt={game.gameName} className="game-image" />}
            <h2>{game.title}</h2>
            <h3>{game.gameName}</h3>
            <p>{game.description}</p>
            <p>Entry Fee: {game.entryFee === 0 ? 'Free' : `$${game.entryFee}`}</p>
            <p>Participants: {game.participants}</p>
            <p>Prize Pool: ${game.prizePool}</p>
            <p>Room ID: {game.roomId}</p>
            <p>Room Password: {game.roomPassword}</p>
            
            <button onClick={() => openParticipantsModal(game.id)} className="btn btn-primary">
              Show Participants
            </button>
            
            <button onClick={() => handleEditGame(game)} className="btn btn-edit">
              Edit
            </button>
            <button onClick={() => handleDeleteGame(game.id)} className="btn btn-delete">
              Delete
            </button>
          </div>
        ))}
      </div>
      
      {/* Modal for showing participants */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeParticipantsModal}
        contentLabel="Participants"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Participants</h2>
        <table className="participants-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {selectedParticipants.map((participant, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{participant.username}</td>
                <td>{participant.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={closeParticipantsModal} className="btn btn-close">
          Close
        </button>
      </Modal>
    </div>
  );
};

export default AdminPanel;
