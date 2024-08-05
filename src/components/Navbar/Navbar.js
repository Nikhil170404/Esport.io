// src/components/Navbar/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../../redux/actions/authAction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faGamepad, faTrophy, faCog, faSignOutAlt, faWallet } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navbarRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event) => {
    if (navbarRef.current && !navbarRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className={`navbar ${isMenuOpen ? 'active' : ''}`} ref={navbarRef}>
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
              <li><Link to="/profile"><FontAwesomeIcon icon={faUser} /> Profile</Link></li>
              <li><Link to="/wallet"><FontAwesomeIcon icon={faWallet} /> Wallet</Link></li>
              <li><Link to="/tournaments"><FontAwesomeIcon icon={faGamepad} /> Tournaments</Link></li>
              <li><Link to="/leaderboard"><FontAwesomeIcon icon={faTrophy} /> Leaderboard</Link></li>
              <li><Link to="/settings"><FontAwesomeIcon icon={faCog} /> Settings</Link></li>
              <li><button className="logout-btn" onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} /> Logout</button></li>
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
