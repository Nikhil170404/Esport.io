import { combineReducers } from 'redux';
import authReducer from './authReducer';
import tournamentReducer from './tournamentReducer';

export default combineReducers({
  auth: authReducer,
  tournament: tournamentReducer,
});
