import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, onMessage, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCxdoKab4agDCag2syrjpeF2vYfNTIbYEE",
  authDomain: "esports-d882d.firebaseapp.com",
  projectId: "esports-d882d",
  storageBucket: "esports-d882d.appspot.com",
  messagingSenderId: "314534424935",
  appId: "1:314534424935:web:4f92b102bb5e61c65f7fc2",
  measurementId: "G-ENZV6LRGB6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const messaging = getMessaging(app);

export { auth, firestore, storage, messaging, getToken, onMessage };