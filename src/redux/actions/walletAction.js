// src/redux/actions/walletAction.js

import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { firestore } from '../../firebase'; // Ensure this path is correct

// Action types
export const FETCH_WALLET_REQUEST = 'FETCH_WALLET_REQUEST';
export const FETCH_WALLET_SUCCESS = 'FETCH_WALLET_SUCCESS';
export const FETCH_WALLET_FAILURE = 'FETCH_WALLET_FAILURE';
export const UPDATE_WALLET_REQUEST = 'UPDATE_WALLET_REQUEST';
export const UPDATE_WALLET_SUCCESS = 'UPDATE_WALLET_SUCCESS';
export const UPDATE_WALLET_FAILURE = 'UPDATE_WALLET_FAILURE';

// Action creators

// Fetch wallet
export const fetchWallet = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_WALLET_REQUEST });
  try {
    const user = getState().auth.user; // Get current user from state
    if (!user) throw new Error('User not logged in');

    const walletRef = doc(firestore, 'wallets', user.uid);
    const walletDoc = await getDoc(walletRef);

    if (walletDoc.exists()) {
      dispatch({
        type: FETCH_WALLET_SUCCESS,
        payload: walletDoc.data()
      });
    } else {
      console.error('No wallet found for this user');
      dispatch({
        type: FETCH_WALLET_FAILURE,
        payload: 'No wallet found for this user'
      });
    }
  } catch (error) {
    console.error('Error fetching wallet: ', error);
    dispatch({
      type: FETCH_WALLET_FAILURE,
      payload: error.message
    });
  }
};

// Update wallet
export const updateWallet = (amount) => async (dispatch, getState) => {
  dispatch({ type: UPDATE_WALLET_REQUEST });
  try {
    const user = getState().auth.user; // Get current user from state
    if (!user) throw new Error('User not logged in');

    const walletRef = doc(firestore, 'wallets', user.uid);
    await updateDoc(walletRef, {
      balance: increment(amount) // Increment balance
    });

    dispatch({
      type: UPDATE_WALLET_SUCCESS,
      payload: { amount }
    });
  } catch (error) {
    console.error('Error updating wallet: ', error);
    dispatch({
      type: UPDATE_WALLET_FAILURE,
      payload: error.message
    });
  }
};
