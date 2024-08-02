import { auth, firestore } from '../../firebase';
import {
  arrayUnion, doc, getDoc, updateDoc, deleteDoc, addDoc, collection, getDocs
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword
} from 'firebase/auth';

// Action types
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS';
export const SIGNUP_FAILURE = 'SIGNUP_FAILURE';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';
export const FETCH_GAMES_REQUEST = 'FETCH_GAMES_REQUEST';
export const FETCH_GAMES_SUCCESS = 'FETCH_GAMES_SUCCESS';
export const FETCH_GAMES_FAILURE = 'FETCH_GAMES_FAILURE';
export const ADD_GAME_SUCCESS = 'ADD_GAME_SUCCESS';
export const ADD_GAME_FAILURE = 'ADD_GAME_FAILURE';
export const UPDATE_GAME_SUCCESS = 'UPDATE_GAME_SUCCESS';
export const UPDATE_GAME_FAILURE = 'UPDATE_GAME_FAILURE';
export const DELETE_GAME_SUCCESS = 'DELETE_GAME_SUCCESS';
export const DELETE_GAME_FAILURE = 'DELETE_GAME_FAILURE';
export const UPDATE_GAME_PARTICIPANTS_SUCCESS = 'UPDATE_GAME_PARTICIPANTS_SUCCESS';
export const UPDATE_GAME_PARTICIPANTS_FAILURE = 'UPDATE_GAME_PARTICIPANTS_FAILURE';
export const PURCHASE_GAME_SUCCESS = 'PURCHASE_GAME_SUCCESS';
export const PURCHASE_GAME_FAILURE = 'PURCHASE_GAME_FAILURE';

// Auth actions
export const login = (email, password) => async (dispatch) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    dispatch({ type: LOGIN_SUCCESS, payload: userCredential.user });
  } catch (error) {
    dispatch({ type: LOGIN_FAILURE, payload: error.message });
  }
};

export const signup = (email, password) => async (dispatch) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    dispatch({ type: SIGNUP_SUCCESS, payload: userCredential.user });
  } catch (error) {
    dispatch({ type: SIGNUP_FAILURE, payload: error.message });
  }
};

export const logout = () => async (dispatch) => {
  try {
    await signOut(auth);
    dispatch({ type: LOGOUT_SUCCESS });
  } catch (error) {
    dispatch({ type: LOGOUT_FAILURE, payload: error.message });
  }
};

// Fetch games action
export const fetchGames = () => async (dispatch) => {
  dispatch({ type: FETCH_GAMES_REQUEST });
  try {
    const gamesCollection = collection(firestore, 'games');
    const gameSnapshot = await getDocs(gamesCollection);
    const gamesList = gameSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    dispatch({ type: FETCH_GAMES_SUCCESS, payload: gamesList });
  } catch (error) {
    dispatch({ type: FETCH_GAMES_FAILURE, payload: error.message });
  }
};

// Add game action
export const addGame = (game) => async (dispatch) => {
  try {
    const gamesCollection = collection(firestore, 'games');
    const docRef = await addDoc(gamesCollection, game);
    dispatch({ type: ADD_GAME_SUCCESS, payload: { id: docRef.id, ...game } });
  } catch (error) {
    dispatch({ type: ADD_GAME_FAILURE, payload: error.message });
  }
};

// Update game action
export const updateGame = (id, game) => async (dispatch) => {
  try {
    const gameRef = doc(firestore, 'games', id);
    await updateDoc(gameRef, game);
    dispatch({ type: UPDATE_GAME_SUCCESS, payload: { id, ...game } });
  } catch (error) {
    dispatch({ type: UPDATE_GAME_FAILURE, payload: error.message });
  }
};

// Delete game action
export const deleteGame = (id) => async (dispatch) => {
  try {
    const gameRef = doc(firestore, 'games', id);
    await deleteDoc(gameRef);
    dispatch({ type: DELETE_GAME_SUCCESS, payload: id });
  } catch (error) {
    dispatch({ type: DELETE_GAME_FAILURE, payload: error.message });
  }
};

// Update game participants action
export const updateGameParticipants = (gameId) => async (dispatch) => {
  try {
    const gameRef = doc(firestore, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (gameDoc.exists()) {
      const gameData = gameDoc.data();
      if (gameData.participants > 0) {
        await updateDoc(gameRef, {
          participants: gameData.participants - 1
        });
        dispatch({ type: UPDATE_GAME_PARTICIPANTS_SUCCESS, payload: { gameId } });
      } else {
        dispatch({ type: UPDATE_GAME_PARTICIPANTS_FAILURE, payload: 'No participants left' });
      }
    } else {
      dispatch({ type: UPDATE_GAME_PARTICIPANTS_FAILURE, payload: 'Game not found' });
    }
  } catch (error) {
    dispatch({ type: UPDATE_GAME_PARTICIPANTS_FAILURE, payload: error.message });
  }
};

// Purchase game action
export const purchaseGame = (gameId) => async (dispatch, getState) => {
  const { auth } = getState();
  const { user } = auth;

  if (!user) {
    console.error("User is not logged in");
    return;
  }

  try {
    const gameRef = doc(firestore, 'games', gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists()) {
      const gameData = gameDoc.data();
      if (gameData.participants <= 0) {
        console.error("No available participant slots");
        return;
      }

      // Update game participants
      await updateDoc(gameRef, {
        participants: gameData.participants - 1
      });

      // Add game to user's purchased games
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        purchasedGames: arrayUnion(gameId)
      });

      dispatch({
        type: PURCHASE_GAME_SUCCESS,
        payload: gameId
      });
    } else {
      console.error("No such game!");
    }
  } catch (error) {
    dispatch({ type: PURCHASE_GAME_FAILURE, payload: error.message });
  }
};
