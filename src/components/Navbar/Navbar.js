// src/components/Navbar/Navbar.js
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../../redux/actions/authAction';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">Esports Platform</Link>
        </div>
        <div className="navbar-toggle" onClick={toggleMenu}>
          <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}></div>
          <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}></div>
          <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}></div>
        </div>
      </div>
      <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/aboutus">About</Link></li>
          <li><Link to="/contactus">Contact</Link></li>
          {user ? (
            <>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/tournaments">Tournaments</Link></li>
              <li><Link to="/leaderboard">Leaderboard</Link></li>
              <li><Link to="/settings">Settings</Link></li>
              <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/signup">Sign Up</Link></li>
              <li><Link to="/login">Login</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
