// src/redux/reducers/tournamentReducer.js

import { 
  FETCH_TOURNAMENTS_REQUEST,
  FETCH_TOURNAMENTS_SUCCESS,
  FETCH_TOURNAMENTS_FAILURE,
  ADD_TOURNAMENT_REQUEST,
  ADD_TOURNAMENT_SUCCESS,
  ADD_TOURNAMENT_FAILURE,
  UPDATE_TOURNAMENT_REQUEST,
  UPDATE_TOURNAMENT_SUCCESS,
  UPDATE_TOURNAMENT_FAILURE,
  DELETE_TOURNAMENT_REQUEST,
  DELETE_TOURNAMENT_SUCCESS,
  DELETE_TOURNAMENT_FAILURE
} from '../actions/types';

const initialState = {
  tournaments: [],
  isLoading: false,
  error: null,
};

const tournamentReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TOURNAMENTS_REQUEST:
      return { ...state, isLoading: true, error: null };
    case FETCH_TOURNAMENTS_SUCCESS:
      return { ...state, isLoading: false, tournaments: action.payload };
    case FETCH_TOURNAMENTS_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    case ADD_TOURNAMENT_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ADD_TOURNAMENT_SUCCESS:
      return { ...state, isLoading: false, tournaments: [...state.tournaments, action.payload] };
    case ADD_TOURNAMENT_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    case UPDATE_TOURNAMENT_REQUEST:
      return { ...state, isLoading: true, error: null };
    case UPDATE_TOURNAMENT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        tournaments: state.tournaments.map(tournament =>
          tournament.id === action.payload.tournamentId ? { ...tournament, ...action.payload.updateFields } : tournament
        ),
      };
    case UPDATE_TOURNAMENT_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    case DELETE_TOURNAMENT_REQUEST:
      return { ...state, isLoading: true, error: null };
    case DELETE_TOURNAMENT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        tournaments: state.tournaments.filter(tournament => tournament.id !== action.payload),
      };
    case DELETE_TOURNAMENT_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

export default tournamentReducer;
