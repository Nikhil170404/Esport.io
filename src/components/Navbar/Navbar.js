// src/components/Navbar/Navbar.js
import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../../redux/actions/authAction';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navbarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (navbarRef.current && !navbarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
  };

  const handleScroll = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const commonNavItems = [
    { to: '/home', icon: 'home', label: 'Home' },
    { to: '/aboutus', icon: 'info-circle', label: 'About' },
    { to: '/contactus', icon: 'envelope', label: 'Contact' }
  ];

  const userNavItems = [
    ...commonNavItems,
    { to: '/profile', icon: 'user', label: 'Profile' },
    { to: '/wallet', icon: 'wallet', label: 'Wallet' },
    { to: '/tournaments', icon: 'gamepad', label: 'Tournaments' },
    { to: '/leaderboard', icon: 'trophy', label: 'Leaderboard' },
    { to: '/community', icon: 'users', label: 'Community' }, // New community link
    { to: '/settings', icon: 'cog', label: 'Settings' }
  ];

  return (
    <nav className="navbar" ref={navbarRef}>
      <button className="navbar-toggle" onClick={toggleSidebar}>
        <div className={`hamburger ${isSidebarOpen ? 'open' : ''}`}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </div>
      </button>
      <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
          <span className="sr-only">Close Sidebar</span>
        </button>
        <div className="sidebar-menu">
          <ul className="sidebar-links">
            {(user ? userNavItems : commonNavItems).map((item) => (
              <li key={item.to} className="sidebar-item">
                <Link to={item.to} className="sidebar-link" onClick={() => setIsSidebarOpen(false)}>
                  <i className={`fa fa-${item.icon}`}></i>
                  <span className="sidebar-label">{item.label}</span>
                </Link>
              </li>
            ))}
            {user ? (
              <li>
                <button className="logout-btn" onClick={handleLogout}>
                  <i className="fa fa-sign-out-alt"></i>
                  <span className="sidebar-label">Logout</span>
                </button>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/signup" className="sidebar-link" onClick={() => setIsSidebarOpen(false)}>
                    <i className="fa fa-user-plus"></i>
                    <span className="sidebar-label">Sign Up</span>
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="sidebar-link" onClick={() => setIsSidebarOpen(false)}>
                    <i className="fa fa-sign-in-alt"></i>
                    <span className="sidebar-label">Login</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
