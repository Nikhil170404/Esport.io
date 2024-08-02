// src/redux/reducers/gameReducer.js

import { 
  FETCH_GAMES_REQUEST,
  FETCH_GAMES_SUCCESS,
  FETCH_GAMES_FAILURE,
  ADD_GAME_REQUEST,
  ADD_GAME_SUCCESS,
  ADD_GAME_FAILURE,
  UPDATE_GAME_PARTICIPANTS_REQUEST,
  UPDATE_GAME_PARTICIPANTS_SUCCESS,
  UPDATE_GAME_PARTICIPANTS_FAILURE,
  DELETE_GAME_REQUEST,
  DELETE_GAME_SUCCESS,
  DELETE_GAME_FAILURE
} from '../actions/types';

const initialState = {
  games: [],
  isLoading: false,
  error: null,
};

const gameReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_GAMES_REQUEST:
      return { ...state, isLoading: true, error: null };
    case FETCH_GAMES_SUCCESS:
      return { ...state, isLoading: false, games: action.payload };
    case FETCH_GAMES_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    case ADD_GAME_REQUEST:
      return { ...state, isLoading: true, error: null };
    case ADD_GAME_SUCCESS:
      return { ...state, isLoading: false, games: [...state.games, action.payload] };
    case ADD_GAME_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    case UPDATE_GAME_PARTICIPANTS_REQUEST:
      return { ...state, isLoading: true, error: null };
    case UPDATE_GAME_PARTICIPANTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        games: state.games.map(game =>
          game.id === action.payload.id ? { ...game, participants: action.payload.participants } : game
        ),
      };
    case UPDATE_GAME_PARTICIPANTS_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    case DELETE_GAME_REQUEST:
      return { ...state, isLoading: true, error: null };
    case DELETE_GAME_SUCCESS:
      return {
        ...state,
        isLoading: false,
        games: state.games.filter(game => game.id !== action.payload),
      };
    case DELETE_GAME_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

export default gameReducer;
