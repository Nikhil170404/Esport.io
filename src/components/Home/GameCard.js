import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { purchaseGame } from '../../redux/actions/gameActions';
import { firestore } from '../../firebase';
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import './GameCard.css';

const GameCard = ({
  id,
  title,
  description,
  gameName,
  entryFee,
  prizeMoney,
  isFavorite,
  onFavorite,
  isPurchased,
  imageUrl = '' // Default value for imageUrl
}) => {
  const [showCredentials, setShowCredentials] = useState(false);
  const [gameCredentials, setGameCredentials] = useState({ roomId: '', roomPassword: '' });
  const [full, setFull] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [participantData, setParticipantData] = useState({
    username: '',
    gameUid: '', // Added gameUid field
    mapDownloaded: false
  });

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const fetchGameData = useCallback(() => {
    const gameRef = doc(firestore, 'games', id);

    const unsubscribe = onSnapshot(gameRef, (docSnapshot) => {
      const gameData = docSnapshot.data();
      if (gameData) {
        setParticipants(gameData.participants);
        setFull(gameData.participants <= 0);
        if (gameData.roomId && gameData.roomPassword) {
          setGameCredentials({
            roomId: gameData.roomId,
            roomPassword: gameData.roomPassword
          });
          if (isPurchased) setShowCredentials(true);
        }
      } else {
        console.error("No such game!");
      }
    });

    return unsubscribe;
  }, [id, isPurchased]);

  useEffect(() => {
    const unsubscribe = fetchGameData();
    return () => unsubscribe();
  }, [fetchGameData]);

  const handlePurchase = async () => {
    if (!user) {
      console.error("User is not logged in");
      return;
    }

    if (full) {
      console.warn("Game is full");
      return;
    }

    try {
      const userPurchasesRef = doc(firestore, 'users', user.uid);
      const userPurchasesDoc = await getDoc(userPurchasesRef);

      if (userPurchasesDoc.exists()) {
        const userPurchasesData = userPurchasesDoc.data();

        if (userPurchasesData.purchasedGames && userPurchasesData.purchasedGames.includes(id)) {
          console.warn("Game already purchased");
          setShowCredentials(true);
          return;
        }

        const gameRef = doc(firestore, 'games', id);
        const gameDoc = await getDoc(gameRef);

        if (gameDoc.exists()) {
          const gameData = gameDoc.data();

          if (gameData.participants > 0) {
            setShowForm(true); // Show form first
          } else {
            setFull(true);
          }
        } else {
          console.error("No such game!");
        }
      }
    } catch (error) {
      console.error("Error purchasing game: ", error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const gameRef = doc(firestore, 'games', id);

      await updateDoc(gameRef, {
        participants: participants - 1, // Decrease participants count here
        participantsData: arrayUnion({
          ...participantData,
          userId: user.uid // Add userId to participantData
        })
      });

      const userPurchasesRef = doc(firestore, 'users', user.uid);
      await updateDoc(userPurchasesRef, {
        purchasedGames: arrayUnion(id),
        purchaseHistory: arrayUnion({
          gameId: id,
          gameName,
          entryFee,
          purchaseDate: new Date()
        })
      });

      dispatch(purchaseGame(gameName));
      setShowForm(false);
      setShowCredentials(true); // Show credentials after purchase
    } catch (error) {
      console.error("Error submitting participant data: ", error);
    }
  };

  const purchaseButtonText = useMemo(() => {
    if (full) {
      return 'Full';
    }
    return isPurchased ? (showCredentials ? 'Hide Credentials' : 'Show Credentials') : `Buy ${entryFee} USD`;
  }, [full, isPurchased, showCredentials, entryFee]);

  const purchaseButtonClass = useMemo(() => {
    if (full) {
      return 'purchase-button full';
    }
    return isPurchased ? 'purchase-button purchased' : 'purchase-button';
  }, [full, isPurchased]);

  const handleButtonClick = () => {
    if (isPurchased) {
      setShowCredentials(!showCredentials);
    } else {
      handlePurchase();
    }
  };

  return (
    <div className="game-card">
      <div className="game-card-header">
        <img src={imageUrl || 'default-image-url.png'} alt={title} className="game-card-image" />
        <h3 className="game-card-title">{title}</h3>
      </div>
      <div className="game-card-content">
        <p className="game-card-description">{description}</p>
        <div className="game-info">
          <p>Participants: {participants}</p>
          <p>Entry Fee: {entryFee} USD</p>
          <p>Prize Money: {prizeMoney} USD</p>
        </div>
        <div className="game-actions">
          <button
            className={purchaseButtonClass}
            onClick={handleButtonClick}
            disabled={full || (isPurchased && showCredentials)} // Disable if full or already purchased and credentials shown
          >
            {purchaseButtonText}
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
              <label>Game UID</label>
              <input
                type="text"
                value={participantData.gameUid}
                onChange={(e) => setParticipantData({ ...participantData, gameUid: e.target.value })}
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
          <div className="game-credentials">
            <h4>Game Credentials:</h4>
            <p>Room ID: {gameCredentials.roomId}</p>
            <p>Room Password: {gameCredentials.roomPassword}</p>
          </div>
        )}
      </div>
    </div>
  );
};

GameCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  gameName: PropTypes.string.isRequired,
  entryFee: PropTypes.number.isRequired,
  prizeMoney: PropTypes.number.isRequired,
  isPurchased: PropTypes.bool.isRequired,
  imageUrl: PropTypes.string
};

export default GameCard;
