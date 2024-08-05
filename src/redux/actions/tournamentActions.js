import { 
  FETCH_TOURNAMENTS_REQUEST, FETCH_TOURNAMENTS_SUCCESS, FETCH_TOURNAMENTS_FAILURE,
  ADD_TOURNAMENT_SUCCESS, ADD_TOURNAMENT_FAILURE,
  DELETE_TOURNAMENT_SUCCESS, DELETE_TOURNAMENT_FAILURE,
  UPDATE_TOURNAMENT_SUCCESS, UPDATE_TOURNAMENT_FAILURE
} from './types';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';

export const fetchTournaments = () => async (dispatch) => {
  dispatch({ type: FETCH_TOURNAMENTS_REQUEST });
  try {
    const tournamentsCollection = collection(firestore, 'tournaments');
    const tournamentSnapshot = await getDocs(tournamentsCollection);
    const tournamentsList = tournamentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    dispatch({ type: FETCH_TOURNAMENTS_SUCCESS, payload: tournamentsList });
  } catch (error) {
    dispatch({ type: FETCH_TOURNAMENTS_FAILURE, payload: error.message });
  }
};

export const addTournament = (tournament) => async (dispatch) => {
  try {
    const tournamentsCollection = collection(firestore, 'tournaments');
    const docRef = await addDoc(tournamentsCollection, tournament);
    dispatch({ type: ADD_TOURNAMENT_SUCCESS, payload: { id: docRef.id, ...tournament } });
  } catch (error) {
    dispatch({ type: ADD_TOURNAMENT_FAILURE, payload: error.message });
  }
};

export const updateTournament = (tournamentId, updateFields) => async (dispatch) => {
  try {
    const tournamentRef = doc(firestore, 'tournaments', tournamentId);
    await updateDoc(tournamentRef, updateFields);
    dispatch({ type: UPDATE_TOURNAMENT_SUCCESS, payload: { tournamentId, ...updateFields } });
  } catch (error) {
    dispatch({ type: UPDATE_TOURNAMENT_FAILURE, payload: error.message });
  }
};

export const deleteTournament = (id) => async (dispatch) => {
  try {
    const tournamentRef = doc(firestore, 'tournaments', id);
    await deleteDoc(tournamentRef);
    dispatch({ type: DELETE_TOURNAMENT_SUCCESS, payload: id });
  } catch (error) {
    dispatch({ type: DELETE_TOURNAMENT_FAILURE, payload: error.message });
  }
};

export const joinTournament = (tournamentId) => async (dispatch) => {
  try {
    // Your logic for joining a tournament here
    dispatch({ type: 'JOIN_TOURNAMENT_SUCCESS', payload: tournamentId });
  } catch (error) {
    dispatch({ type: 'JOIN_TOURNAMENT_FAILURE', payload: error.message });
  }
};



