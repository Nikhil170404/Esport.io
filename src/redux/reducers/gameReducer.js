import {
  FETCH_GAMES_REQUEST,
  FETCH_GAMES_SUCCESS,
  FETCH_GAMES_FAILURE,
  ADD_GAME_SUCCESS,
  ADD_GAME_FAILURE,
  UPDATE_GAME_SUCCESS,
  UPDATE_GAME_FAILURE,
  DELETE_GAME_SUCCESS,
  DELETE_GAME_FAILURE,
  UPDATE_GAME_PARTICIPANTS_SUCCESS,
  UPDATE_GAME_PARTICIPANTS_FAILURE
} from '../actions/gameActions';

// Initial state
const initialState = {
  games: [],
  isLoading: false,
  error: null,
};

// Reducer function
const gameReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_GAMES_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case FETCH_GAMES_SUCCESS:
      return {
        ...state,
        games: action.payload,
        isLoading: false,
        error: null,
      };
    case FETCH_GAMES_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case ADD_GAME_SUCCESS:
      return {
        ...state,
        games: [...state.games, action.payload],
        error: null,
      };
    case ADD_GAME_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    case UPDATE_GAME_SUCCESS:
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.id ? { ...game, ...action.payload.updatedGameData } : game
        ),
        error: null,
      };
    case UPDATE_GAME_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    case DELETE_GAME_SUCCESS:
      return {
        ...state,
        games: state.games.filter(game => game.id !== action.payload),
        error: null,
      };
    case DELETE_GAME_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    case UPDATE_GAME_PARTICIPANTS_SUCCESS:
      return {
        ...state,
        games: state.games.map(game => {
          if (game.gameName === action.payload.gameName) {
            return { ...game, participants: game.participants - 1 };
          }
          return game;
        }),
        error: null,
      };
    case UPDATE_GAME_PARTICIPANTS_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default gameReducer;
