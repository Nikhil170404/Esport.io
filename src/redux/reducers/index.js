// src/redux/reducers/index.js

import { combineReducers } from 'redux';
import authReducer from './authReducer';
import tournamentReducer from './tournamentReducer';
import walletReducer from './walletReducer'; // Import walletReducer

export default combineReducers({
  auth: authReducer,
  tournament: tournamentReducer,
  wallet: walletReducer, // Add walletReducer to the combined reducers
});
