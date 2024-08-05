import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTournaments, addTournament, updateTournament, deleteTournament } from '../../redux/actions/tournamentActions';
import { doc, getDoc } from 'firebase/firestore';
import { firestore, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Modal from 'react-modal';
import './Admin.css';

Modal.setAppElement('#root');

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { tournaments, isLoading, error } = useSelector((state) => state.tournament);

  const [formData, setFormData] = useState({
    title: '',
    tournamentName: '',
    description: '',
    entryFee: 0,
    participants: 0,
    prizePool: 0,
    image: null,
    isPaid: true,
    roomId: '',
    roomPassword: '',
    currentTournamentId: null,
  });

  const [participantsData, setParticipantsData] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  useEffect(() => {
    const fetchParticipantsData = async () => {
      const newParticipantsData = {};
      for (const tournament of tournaments) {
        const tournamentRef = doc(firestore, 'tournaments', tournament.id);
        const tournamentDoc = await getDoc(tournamentRef);
        const tournamentData = tournamentDoc.data();
        if (tournamentData && tournamentData.participantsData) {
          newParticipantsData[tournament.id] = tournamentData.participantsData;
        }
      }
      setParticipantsData(newParticipantsData);
    };

    fetchParticipantsData();
  }, [tournaments]);

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
      const imageRef = ref(storage, `tournament-images/${formData.image.name}`);
      await uploadBytes(imageRef, formData.image);
      imageUrl = await getDownloadURL(imageRef);
    }

    const tournamentData = {
      title: formData.title,
      tournamentName: formData.tournamentName,
      description: formData.description,
      entryFee: formData.isPaid ? formData.entryFee : 0,
      participants: formData.participants,
      prizePool: formData.prizePool,
      imageUrl: imageUrl || formData.imageUrl, // Use existing image if no new one is uploaded
      isPaid: formData.isPaid,
      roomId: formData.roomId,
      roomPassword: formData.roomPassword,
    };

    if (formData.currentTournamentId) {
      await dispatch(updateTournament(formData.currentTournamentId, tournamentData));
    } else {
      await dispatch(addTournament(tournamentData));
    }

    // Clear the form after submission
    setFormData({
      title: '',
      tournamentName: '',
      description: '',
      entryFee: 0,
      participants: 0,
      prizePool: 0,
      image: null,
      isPaid: true,
      roomId: '',
      roomPassword: '',
      currentTournamentId: null,
    });
  };

  const handleEditTournament = (tournament) => {
    setFormData({
      ...tournament,
      isPaid: tournament.entryFee > 0,
      image: null,
      currentTournamentId: tournament.id,
    });
  };

  const openParticipantsModal = (tournamentId) => {
    setSelectedParticipants(participantsData[tournamentId] || []);
    setModalIsOpen(true);
  };

  const closeParticipantsModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <div className="admin-form">
        {['title', 'tournamentName', 'description', 'entryFee', 'participants', 'prizePool', 'roomId', 'roomPassword'].map((field, index) => (
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
          <label>Tournament Image</label>
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
          {formData.currentTournamentId ? 'Update Tournament' : 'Add Tournament'}
        </button>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="admin-error">{error}</p>}

      <div className="game-list">
        {tournaments.map(tournament => (
          <div key={tournament.id} className="game-card">
            {tournament.imageUrl && <img src={tournament.imageUrl} alt={tournament.tournamentName} className="game-image" />}
            <h2>{tournament.title}</h2>
            <h3>{tournament.tournamentName}</h3>
            <p>{tournament.description}</p>
            <p>Entry Fee: {tournament.entryFee === 0 ? 'Free' : `₹${tournament.entryFee}`}</p>
            <p>Participants: {tournament.participants}</p>
            <p>Prize Pool: ₹{tournament.prizePool}</p>
            <p>Room ID: {tournament.roomId}</p>
            <p>Room Password: {tournament.roomPassword}</p>
            
            <button onClick={() => openParticipantsModal(tournament.id)} className="btn btn-primary">
              Show Participants
            </button>
            
            <button onClick={() => handleEditTournament(tournament)} className="btn btn-edit">
              Edit
            </button>
            <button onClick={() => dispatch(deleteTournament(tournament.id))} className="btn btn-delete">
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
