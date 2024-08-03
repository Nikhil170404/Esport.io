import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { purchaseGame } from '../../redux/actions/gameActions';
import { firestore } from '../../firebase';
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShoppingCart, faStar } from '@fortawesome/free-solid-svg-icons';
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
  const [participants, setParticipants] = useState(0); // Add state for participants

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const fetchGameData = useCallback(() => {
    const gameRef = doc(firestore, 'games', id);

    const unsubscribe = onSnapshot(gameRef, (docSnapshot) => {
      const gameData = docSnapshot.data();
      if (gameData) {
        console.log(`Game data: ${JSON.stringify(gameData)}`);
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

    return unsubscribe; // Clean up subscription on unmount
  }, [id, isPurchased]);

  useEffect(() => {
    const unsubscribe = fetchGameData();
    return () => unsubscribe(); // Clean up subscription on unmount
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
      const gameRef = doc(firestore, 'games', id);
      const gameDoc = await getDoc(gameRef);

      if (gameDoc.exists()) {
        const gameData = gameDoc.data();

        if (gameData.participants > 0) {
          await updateDoc(gameRef, {
            participants: gameData.participants - 1
          });

          const userPurchasesRef = doc(firestore, 'users', user.uid);
          await updateDoc(userPurchasesRef, {
            purchasedGames: arrayUnion(id)
          });

          dispatch(purchaseGame(gameName));
          setShowCredentials(true);
        } else {
          setFull(true);
        }
      } else {
        console.error("No such game!");
      }
    } catch (error) {
      console.error("Error purchasing game: ", error);
    }
  };

  const purchaseButtonText = useMemo(() => {
    if (full) {
      return 'Full';
    }
    return isPurchased ? 'Purchased' : `Buy ${entryFee} USD`;
  }, [full, isPurchased, entryFee]);

  const favoriteIcon = useMemo(() => (
    isFavorite ? faHeart : faStar
  ), [isFavorite]);

  return (
    <div className="game-card">
      <div className="game-card-header">
        <img src={imageUrl || 'default-image-url.png'} alt={title} className="game-image" />
        <h3 className="game-title">{title}</h3>
      </div>
      <p className="game-description">{description}</p>
      <div className="game-info">
        <p>Participants: {participants}</p>
        <p>Entry Fee: {entryFee} USD</p>
        <p>Prize Money: {prizeMoney} USD</p>
      </div>
      <div className="game-actions">
        <button
          className="purchase-button"
          onClick={handlePurchase}
          disabled={isPurchased || full}
        >
          <FontAwesomeIcon icon={faShoppingCart} />
          {purchaseButtonText}
        </button>
        <button className="favorite-button" onClick={() => onFavorite(gameName)}>
          <FontAwesomeIcon icon={favoriteIcon} />
        </button>
      </div>
      {showCredentials && (
        <div className="game-credentials">
          <h4>Game Credentials:</h4>
          <p>Room ID: {gameCredentials.roomId}</p>
          <p>Room Password: {gameCredentials.roomPassword}</p>
        </div>
      )}
    </div>
  );
};

GameCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  gameName: PropTypes.string.isRequired,
  entryFee: PropTypes.number.isRequired,
  prizeMoney: PropTypes.number.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  onFavorite: PropTypes.func.isRequired,
  isPurchased: PropTypes.bool.isRequired,
  imageUrl: PropTypes.string
};

export default GameCard;
