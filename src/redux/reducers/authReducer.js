const initialState = {
  user: null,
  isLoading: false,
  error: null,
  purchasedGames: [],
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        purchasedGames: action.payload.purchasedGames || [],
        isLoading: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        purchasedGames: action.payload.purchasedGames || [],
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
    case 'UPDATE_USER_FAILURE':
    case 'LOGOUT_FAILURE':
    case 'PURCHASE_GAME_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        user: null,
        purchasedGames: [],
        error: null,
      };
    case 'UPDATE_USER_SUCCESS':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
        error: null,
      };
    case 'PURCHASE_GAME_SUCCESS':
      return {
        ...state,
        purchasedGames: [...state.purchasedGames, action.payload.gameName],
      };
    default:
      return state;
  }
};

export default authReducer;
