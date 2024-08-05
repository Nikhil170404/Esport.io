import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGames, addGame, updateGame, deleteGame } from '../../redux/actions/gameActions';
import { doc, getDoc } from 'firebase/firestore';
import { firestore, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Modal from 'react-modal';
import './Admin.css';

Modal.setAppElement('#root');

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { games, isLoading, error } = useSelector((state) => state.game);

  const [formData, setFormData] = useState({
    title: '',
    gameName: '',
    description: '',
    entryFee: 0,
    participants: 0,
    prizePool: 0,
    image: null,
    isPaid: true,
    roomId: '',
    roomPassword: '',
    currentGameId: null,
  });

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async () => {
    let imageUrl = '';

    if (formData.image) {
      const imageRef = ref(storage, `game-images/${formData.image.name}`);
      await uploadBytes(imageRef, formData.image);
      imageUrl = await getDownloadURL(imageRef);
    }

    const newGame = {
      title: formData.title,
      gameName: formData.gameName,
      description: formData.description,
      entryFee: formData.isPaid ? formData.entryFee : 0,
      participants: formData.participants,
      prizePool: formData.prizePool,
      imageUrl: imageUrl,
      isPaid: formData.isPaid,
      roomId: formData.roomId,
      roomPassword: formData.roomPassword,
      currentGameId: formData.currentGameId,
    };

    if (formData.currentGameId) {
      await dispatch(updateGame(newGame));
    } else {
      await dispatch(addGame(newGame));
    }

    setFormData({
      title: '',
      gameName: '',
      description: '',
      entryFee: 0,
      participants: 0,
      prizePool: 0,
      image: null,
      isPaid: true,
      roomId: '',
      roomPassword: '',
      currentGameId: null,
    });
  };

  const handleEditGame = (game) => {
    setFormData({
      ...game,
      isPaid: game.entryFee > 0,
      image: null,
    });
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
        {['title', 'gameName', 'description', 'entryFee', 'participants', 'prizePool', 'roomId', 'roomPassword'].map((field, index) => (
          <div className="form-group" key={index}>
            <label>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
            <input 
              type={field.includes('Fee') || field.includes('Pool') || field.includes('Participants') ? 'number' : 'text'}
              name={field}
              placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              value={formData[field]} 
              onChange={handleChange} 
              disabled={!formData.isPaid && field === 'entryFee'}
            />
          </div>
        ))}
        <div className="form-group">
          <label>Game Image</label>
          <input type="file" name="image" onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Paid/Free</label>
          <select name="isPaid" value={formData.isPaid.toString()} onChange={(e) => setFormData({ ...formData, isPaid: e.target.value === 'true' })}>
            <option value="true">Paid</option>
            <option value="false">Free</option>
          </select>
        </div>
        <button onClick={handleSubmit} className="btn btn-primary">
          {formData.currentGameId ? 'Update Game' : 'Add Game'}
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
            <button onClick={() => dispatch(deleteGame(game.id))} className="btn btn-delete">
              Delete
            </button>
          </div>
        ))}
      </div>
      
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
