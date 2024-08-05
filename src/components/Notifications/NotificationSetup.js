// src/components/Notifications/NotificationSetup.js
import React, { useEffect } from 'react';
import { messaging, getToken } from '../../firebase';

const NotificationSetup = () => {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const token = await getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY' });
        if (token) {
          console.log('FCM Token:', token);
          // You can save the token to your server/database here
        } else {
          console.log('No registration token available.');
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };

    requestPermission();
  }, []);

  return <div>Notification setup complete.</div>;
};

export default NotificationSetup;
