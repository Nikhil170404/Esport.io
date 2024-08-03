import { 
  FETCH_GAMES_REQUEST, FETCH_GAMES_SUCCESS, FETCH_GAMES_FAILURE,
  ADD_GAME_SUCCESS, ADD_GAME_FAILURE,
  DELETE_GAME_SUCCESS, DELETE_GAME_FAILURE,
  UPDATE_GAME_SUCCESS, UPDATE_GAME_FAILURE
} from './types';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';

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

export const addGame = (game) => async (dispatch) => {
  try {
    const gamesCollection = collection(firestore, 'games');
    const docRef = await addDoc(gamesCollection, game);
    dispatch({ type: ADD_GAME_SUCCESS, payload: { id: docRef.id, ...game } });
  } catch (error) {
    dispatch({ type: ADD_GAME_FAILURE, payload: error.message });
  }
};

export const updateGame = (gameId, updateFields) => async (dispatch) => {
  try {
    const gameRef = doc(firestore, 'games', gameId);
    await updateDoc(gameRef, updateFields);
    dispatch({ type: UPDATE_GAME_SUCCESS, payload: { gameId, ...updateFields } });
  } catch (error) {
    dispatch({ type: UPDATE_GAME_FAILURE, payload: error.message });
  }
};

export const deleteGame = (id) => async (dispatch) => {
  try {
    const gameRef = doc(firestore, 'games', id);
    await deleteDoc(gameRef);
    dispatch({ type: DELETE_GAME_SUCCESS, payload: id });
  } catch (error) {
    dispatch({ type: DELETE_GAME_FAILURE, payload: error.message });
  }
};

export const purchaseGame = (gameId) => async (dispatch) => {
  try {
    // Your purchase logic here
    dispatch({ type: 'PURCHASE_GAME_SUCCESS', payload: gameId });
  } catch (error) {
    dispatch({ type: 'PURCHASE_GAME_FAILURE', payload: error.message });
  }
};
