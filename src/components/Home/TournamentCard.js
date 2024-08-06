import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { joinTournament } from '../../redux/actions/tournamentActions';
import { fetchWallet, updateWallet } from '../../redux/actions/walletAction';
import { firestore } from '../../firebase';
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, increment } from 'firebase/firestore';
import './TournamentCard.css';

const TournamentCard = ({
  id,
  title,
  description,
  tournamentName,
  entryFee,
  prizeMoney,
  isFavorite = false,
  onFavorite = () => {},
  isJoined = false,
  imageUrl = ''
}) => {
  const [state, setState] = useState({
    showCredentials: false,
    tournamentCredentials: { roomId: '', roomPassword: '' },
    full: false,
    participants: 0,
    showForm: false,
    showPaymentPrompt: false,
    confirmationMessage: ''
  });

  const [participantData, setParticipantData] = useState({
    username: '',
    tournamentUid: '',
    mapDownloaded: false
  });

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);

  const fetchTournamentData = useCallback(() => {
    const tournamentRef = doc(firestore, 'tournaments', id);

    const unsubscribe = onSnapshot(tournamentRef, (docSnapshot) => {
      const tournamentData = docSnapshot.data();
      if (tournamentData) {
        setState((prevState) => ({
          ...prevState,
          participants: tournamentData.participants,
          full: tournamentData.participants <= 0,
          tournamentCredentials: {
            roomId: tournamentData.roomId || prevState.tournamentCredentials.roomId,
            roomPassword: tournamentData.roomPassword || prevState.tournamentCredentials.roomPassword
          },
          showCredentials: isJoined && tournamentData.roomId && tournamentData.roomPassword
        }));
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

  useEffect(() => {
    if (user) {
      dispatch(fetchWallet());
    }
  }, [dispatch, user]);

  const handlePayment = useCallback(async () => {
    if (user && balance !== undefined) {
      if (balance < entryFee) {
        console.warn("Insufficient funds. Please add funds to your wallet.");
        setState((prevState) => ({ ...prevState, showPaymentPrompt: true }));
        return false;
      }
      return true;
    } else {
      console.error("Error fetching wallet or user data.");
      setState((prevState) => ({ ...prevState, showPaymentPrompt: true }));
      return false;
    }
  }, [user, balance, entryFee]);

  const updateWalletBalance = useCallback(async (amount) => {
    if (user) {
      const userWalletRef = doc(firestore, 'users', user.uid);
      await updateDoc(userWalletRef, {
        balance: increment(-amount)
      });

      dispatch(updateWallet(balance - amount));
    }
  }, [user, balance, dispatch]);

  const handleJoin = useCallback(async () => {
    if (!user) {
      console.error("User is not logged in");
      return;
    }

    if (state.full) {
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
          setState((prevState) => ({ ...prevState, showCredentials: true }));
          return;
        }

        if (entryFee > 0) {
          const paymentSuccess = await handlePayment();
          if (!paymentSuccess) return;

          await updateWalletBalance(entryFee);
          setState((prevState) => ({
            ...prevState,
            confirmationMessage: `Successfully joined the tournament. ₹${entryFee} has been deducted from your wallet.`
          }));
        }

        const tournamentRef = doc(firestore, 'tournaments', id);
        const tournamentDoc = await getDoc(tournamentRef);

        if (tournamentDoc.exists()) {
          const tournamentData = tournamentDoc.data();

          if (tournamentData.participants > 0) {
            setState((prevState) => ({ ...prevState, showForm: true }));
          } else {
            setState((prevState) => ({ ...prevState, full: true }));
          }
        } else {
          console.error("No such tournament!");
        }
      }
    } catch (error) {
      console.error("Error joining tournament: ", error);
    }
  }, [user, id, state.full, entryFee, handlePayment, updateWalletBalance]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const tournamentRef = doc(firestore, 'tournaments', id);

      await updateDoc(tournamentRef, {
        participants: state.participants - 1,
        participantsData: arrayUnion({
          ...participantData,
          userId: user.uid
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
      setState((prevState) => ({
        ...prevState,
        showForm: false,
        showCredentials: true
      }));
    } catch (error) {
      console.error("Error submitting participant data: ", error);
    }
  };

  const joinButtonText = useMemo(() => {
    if (state.full) {
      return 'Full';
    }
    return isJoined ? (state.showCredentials ? 'Hide Credentials' : 'Show Credentials') : `Join ₹${entryFee}`;
  }, [state.full, isJoined, state.showCredentials, entryFee]);

  const joinButtonClass = useMemo(() => {
    if (state.full) {
      return 'join-button full';
    }
    return isJoined ? 'join-button joined' : 'join-button';
  }, [state.full, isJoined]);

  const handleButtonClick = () => {
    if (isJoined) {
      setState((prevState) => ({ ...prevState, showCredentials: !prevState.showCredentials }));
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
          <p>Participants: {state.participants}</p>
          <p>Entry Fee: ₹{entryFee}</p>
          <p>Prize Money: ₹{prizeMoney}</p>
        </div>
        <div className="tournament-actions">
          <button
            className={joinButtonClass}
            onClick={handleButtonClick}
            disabled={state.full || (isJoined && state.showCredentials)}
          >
            {joinButtonText}
          </button>
        </div>
        {state.showForm && (
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
              <label>
                <input
                  type="checkbox"
                  checked={participantData.mapDownloaded}
                  onChange={(e) => setParticipantData({ ...participantData, mapDownloaded: e.target.checked })}
                />
                Map Downloaded
              </label>
            </div>
            <button type="submit" className="submit-button">Submit</button>
          </form>
        )}
        {state.showCredentials && (
          <div className="credentials">
            <p>Room ID: {state.tournamentCredentials.roomId}</p>
            <p>Password: {state.tournamentCredentials.roomPassword}</p>
          </div>
        )}
        {state.showPaymentPrompt && (
          <div className="payment-prompt">
            <p>Insufficient funds! Please add funds to your wallet.</p>
          </div>
        )}
        {state.confirmationMessage && (
          <div className="confirmation-message">
            <p>{state.confirmationMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

TournamentCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  tournamentName: PropTypes.string.isRequired,
  entryFee: PropTypes.number.isRequired,
  prizeMoney: PropTypes.number.isRequired,
  isFavorite: PropTypes.bool,
  onFavorite: PropTypes.func,
  isJoined: PropTypes.bool,
  imageUrl: PropTypes.string
};

export default TournamentCard;
