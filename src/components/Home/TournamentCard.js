import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { joinTournament } from '../../redux/actions/tournamentActions';
import { firestore } from '../../firebase';
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import './TournamentCard.css';

const TournamentCard = ({
  id,
  title,
  description,
  tournamentName,
  entryFee,
  prizeMoney,
  isFavorite,
  onFavorite,
  isJoined,
  imageUrl = '' // Default value for imageUrl
}) => {
  const [showCredentials, setShowCredentials] = useState(false);
  const [tournamentCredentials, setTournamentCredentials] = useState({ roomId: '', roomPassword: '' });
  const [full, setFull] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [participantData, setParticipantData] = useState({
    username: '',
    tournamentUid: '', // Added tournamentUid field
    mapDownloaded: false
  });

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const fetchTournamentData = useCallback(() => {
    const tournamentRef = doc(firestore, 'tournaments', id);

    const unsubscribe = onSnapshot(tournamentRef, (docSnapshot) => {
      const tournamentData = docSnapshot.data();
      if (tournamentData) {
        setParticipants(tournamentData.participants);
        setFull(tournamentData.participants <= 0);
        if (tournamentData.roomId && tournamentData.roomPassword) {
          setTournamentCredentials({
            roomId: tournamentData.roomId,
            roomPassword: tournamentData.roomPassword
          });
          if (isJoined) setShowCredentials(true);
        }
      } else {
        console.error("No such tournament!");
      }
    });

    return unsubscribe;
  }, [id, isJoined]);

  useEffect(() => {
    const unsubscribe = fetchTournamentData();
    return () => unsubscribe();
  }, [fetchTournamentData]);

  const handleJoin = async () => {
    if (!user) {
      console.error("User is not logged in");
      return;
    }

    if (full) {
      console.warn("Tournament is full");
      return;
    }

    try {
      const userTournamentsRef = doc(firestore, 'users', user.uid);
      const userTournamentsDoc = await getDoc(userTournamentsRef);

      if (userTournamentsDoc.exists()) {
        const userTournamentsData = userTournamentsDoc.data();

        if (userTournamentsData.joinedTournaments && userTournamentsData.joinedTournaments.includes(id)) {
          console.warn("Tournament already joined");
          setShowCredentials(true);
          return;
        }

        const tournamentRef = doc(firestore, 'tournaments', id);
        const tournamentDoc = await getDoc(tournamentRef);

        if (tournamentDoc.exists()) {
          const tournamentData = tournamentDoc.data();

          if (tournamentData.participants > 0) {
            setShowForm(true); // Show form first
          } else {
            setFull(true);
          }
        } else {
          console.error("No such tournament!");
        }
      }
    } catch (error) {
      console.error("Error joining tournament: ", error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const tournamentRef = doc(firestore, 'tournaments', id);

      await updateDoc(tournamentRef, {
        participants: participants - 1, // Decrease participants count here
        participantsData: arrayUnion({
          ...participantData,
          userId: user.uid // Add userId to participantData
        })
      });

      const userTournamentsRef = doc(firestore, 'users', user.uid);
      await updateDoc(userTournamentsRef, {
        joinedTournaments: arrayUnion(id),
        joinHistory: arrayUnion({
          tournamentId: id,
          tournamentName,
          entryFee,
          joinDate: new Date()
        })
      });

      dispatch(joinTournament(tournamentName));
      setShowForm(false);
      setShowCredentials(true); // Show credentials after join
    } catch (error) {
      console.error("Error submitting participant data: ", error);
    }
  };

  const joinButtonText = useMemo(() => {
    if (full) {
      return 'Full';
    }
    return isJoined ? (showCredentials ? 'Hide Credentials' : 'Show Credentials') : `Join ${entryFee} USD`;
  }, [full, isJoined, showCredentials, entryFee]);

  const joinButtonClass = useMemo(() => {
    if (full) {
      return 'join-button full';
    }
    return isJoined ? 'join-button joined' : 'join-button';
  }, [full, isJoined]);

  const handleButtonClick = () => {
    if (isJoined) {
      setShowCredentials(!showCredentials);
    } else {
      handleJoin();
    }
  };

  return (
    <div className="tournament-card">
      <div className="tournament-card-header">
        <img src={imageUrl || 'default-image-url.png'} alt={title} className="tournament-card-image" />
        <h3 className="tournament-card-title">{title}</h3>
      </div>
      <div className="tournament-card-content">
        <p className="tournament-card-description">{description}</p>
        <div className="tournament-info">
          <p>Participants: {participants}</p>
          <p>Entry Fee: {entryFee} USD</p>
          <p>Prize Money: {prizeMoney} USD</p>
        </div>
        <div className="tournament-actions">
          <button
            className={joinButtonClass}
            onClick={handleButtonClick}
            disabled={full || (isJoined && showCredentials)} // Disable if full or already joined and credentials shown
          >
            {joinButtonText}
          </button>
        </div>
        {showForm && (
          <form className="participant-form" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={participantData.username}
                onChange={(e) => setParticipantData({ ...participantData, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Tournament UID</label>
              <input
                type="text"
                value={participantData.tournamentUid}
                onChange={(e) => setParticipantData({ ...participantData, tournamentUid: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Map Downloaded?</label>
              <select
                value={participantData.mapDownloaded ? 'yes' : 'no'}
                onChange={(e) => setParticipantData({ ...participantData, mapDownloaded: e.target.value === 'yes' })}
                required
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <button type="submit" className="submit-button">Submit</button>
          </form>
        )}
        {showCredentials && (
          <div className="tournament-credentials">
            <h4>Tournament Credentials:</h4>
            <p>Room ID: {tournamentCredentials.roomId}</p>
            <p>Room Password: {tournamentCredentials.roomPassword}</p>
          </div>
        )}
      </div>
    </div>
  );
};

TournamentCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  tournamentName: PropTypes.string.isRequired,
  entryFee: PropTypes.number.isRequired,
  prizeMoney: PropTypes.number.isRequired,
  isJoined: PropTypes.bool.isRequired,
  imageUrl: PropTypes.string
};

export default TournamentCard;
