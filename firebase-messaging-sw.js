/* eslint-env worker */
/* global firebase */
/* eslint-disable no-restricted-globals */

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyCxdoKab4agDCag2syrjpeF2vYfNTIbYEE",
  authDomain: "esports-d882d.firebaseapp.com",
  projectId: "esports-d882d",
  storageBucket: "esports-d882d.appspot.com",
  messagingSenderId: "314534424935",
  appId: "1:314534424935:web:4f92b102bb5e61c65f7fc2",
  measurementId: "G-ENZV6LRGB6"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
