import { auth, firestore } from '../../firebase';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

// Admin UID
const ADMIN_UID = 'r7yLC41g4tMQqUCd5y4Rjls6Pch2';

// Action for user login
// Improved login action
export const login = (email, password) => async (dispatch) => {
  dispatch({ type: 'LOGIN_REQUEST' }); // Optional: Dispatch a loading action
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const isAdmin = user.uid === ADMIN_UID;

    // Fetch user purchases
    const userPurchasesRef = doc(firestore, 'userPurchases', user.uid);
    const userPurchasesDoc = await getDoc(userPurchasesRef);

    let purchasedGames = [];
    if (userPurchasesDoc.exists()) {
      purchasedGames = userPurchasesDoc.data().purchases || [];
    } else {
      await setDoc(userPurchasesRef, { purchases: [] });
    }

    const userData = { ...user, isAdmin };
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userData, purchasedGames } });
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('lastActivity', new Date().toString());
  } catch (error) {
    dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
    console.error('Login failed:', error.message); // Enhanced error logging
  }
};

// Action for user signup
export const signup = (userData) => async (dispatch) => {
  try {
    const { email, password, name, age } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const isAdmin = user.uid === ADMIN_UID;

    // Save additional user information in Firestore
    await setDoc(doc(firestore, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name,
      age,
      isAdmin
    });

    // Initialize user purchases in Firestore
    await setDoc(doc(firestore, 'userPurchases', user.uid), { purchases: [] });

    const userDataWithInfo = { ...user, name, age, isAdmin };

    dispatch({ type: 'SIGNUP_SUCCESS', payload: userDataWithInfo });

    // Save user data to local storage
    localStorage.setItem('user', JSON.stringify(userDataWithInfo));
    localStorage.setItem('lastActivity', new Date().toString());
  } catch (error) {
    dispatch({ type: 'SIGNUP_FAILURE', payload: error.message });
  }
};

// Action for user logout
export const logout = () => async (dispatch) => {
  try {
    await signOut(auth);
    dispatch({ type: 'LOGOUT_SUCCESS' });
    // Clear user data from local storage
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
  } catch (error) {
    dispatch({ type: 'LOGOUT_FAILURE', payload: error.message });
  }
};

// Action for updating user profile
// Action for updating user profile
export const updateUser = (uid, userData) => async (dispatch) => {
  try {
    const { name, age, bio, profileImage, gameUid } = userData;

    // Update user profile in Firebase Auth
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, { displayName: name, photoURL: profileImage });
    }

    // Update additional user information in Firestore
    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, { name, age, bio, profileImage, gameUid });

    dispatch({ type: 'UPDATE_USER_SUCCESS', payload: { uid, name, age, bio, profileImage, gameUid } });
  } catch (error) {
    dispatch({ type: 'UPDATE_USER_FAILURE', payload: error.message });
  }
};


// Action to set user from local storage
export const setUser = (user) => ({
  type: 'SET_USER',
  payload: user,
});

// Action to purchase a game
export const purchaseGame = (gameName) => async (dispatch, getState) => {
  try {
    const state = getState();
    const user = state.auth.user;

    if (!user) throw new Error('User not logged in');

    // Check if the game is already purchased
    const userPurchasesRef = doc(firestore, 'userPurchases', user.uid);
    const userPurchasesDoc = await getDoc(userPurchasesRef);
    const currentPurchases = userPurchasesDoc.exists() ? userPurchasesDoc.data().purchases || [] : [];

    if (currentPurchases.includes(gameName)) {
      throw new Error('Game already purchased');
    }

    // Update game participants in Firestore
    await updateGameParticipants(gameName);

    // Add purchased game to user's purchased games
    await updateDoc(userPurchasesRef, {
      purchases: [...currentPurchases, gameName]
    });

    dispatch({ type: 'PURCHASE_GAME_SUCCESS', payload: { gameName } });
  } catch (error) {
    dispatch({ type: 'PURCHASE_GAME_FAILURE', payload: error.message });
  }
};

// Function to update game participants
const updateGameParticipants = async (gameName) => {
  const gameRef = doc(firestore, 'games', gameName);
  const gameDoc = await getDoc(gameRef);
  
  if (gameDoc.exists()) {
    const gameData = gameDoc.data();
    const updatedParticipants = gameData.participants - 1;
    
    if (updatedParticipants >= 0) {
      await updateDoc(gameRef, { participants: updatedParticipants });
    } else {
      throw new Error('No participants left for this game');
    }
  } else {
    throw new Error('Game not found');
  }
};

export const purchaseTournament = (tournamentId) => async (dispatch, getState) => {
  try {
    const state = getState();
    const user = state.auth.user;

    if (!user) throw new Error('User not logged in');

    // Perform tournament purchase logic here

    dispatch({ type: 'PURCHASE_TOURNAMENT_SUCCESS', payload: tournamentId });
  } catch (error) {
    dispatch({ type: 'PURCHASE_TOURNAMENT_FAILURE', payload: error.message });
  }
};