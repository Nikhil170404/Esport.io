// src/App.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { setUser } from './redux/actions/authAction';
import Navbar from './components/Navbar/Navbar';
import LandingPage from './components/LandingPage/LandingPage';
import Home from './components/Home/Home';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import Profile from './components/Profile/Profile';
import Admin from './components/Admin/Admin';
import AboutUs from './components/AboutUs/AboutUs';
import ContactUs from './components/ContactUs/ContactUs';
import Tournaments from './components/Tournaments/Tournaments';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Settings from './components/Settings/Settings';
import Community from './components/Community/Community';
import Wallet from './components/Wallet/Wallet';
import PostAchievement from './components/PostAchievement/PostAchievement'; // Import PostAchievement component
import GroupChat from './components/GroupChat/GroupChat'; // Import GroupChat component
import GroupManagement from './components/GroupManagement/GroupManagement'; // Import GroupManagement component
import './index.css';

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      dispatch(setUser(parsedUser));
    }
  }, [dispatch]);

  // Determine the route to redirect based on user authentication state
  const determineRedirectPath = () => {
    if (user) {
      return user.isAdmin ? '/admin' : '/home';
    }
    return '/';
  };

  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={user && !user.isAdmin ? <Home /> : <Navigate to={determineRedirectPath()} />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to={determineRedirectPath()} />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to={determineRedirectPath()} />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user && user.isAdmin ? <Admin /> : <Navigate to="/login" />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/tournaments" element={user ? <Tournaments /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={user ? <Leaderboard /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/community" element={user ? <Community /> : <Navigate to="/login" />} />
          <Route path="/wallet" element={user ? <Wallet /> : <Navigate to="/login" />} />
          <Route path="/postachievement" element={user ? <PostAchievement /> : <Navigate to="/login" />} /> {/* Post Achievement Route */}
          <Route path="/groupchat/:groupId" element={user ? <GroupChat /> : <Navigate to="/login" />} /> {/* Group Chat Route */}
          <Route path="/groupmanagement" element={user ? <GroupManagement /> : <Navigate to="/login" />} /> {/* Group Management Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
