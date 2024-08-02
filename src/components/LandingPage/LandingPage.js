import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1 className="fade-in">Welcome to the Esports Platform</h1>
        <p className="fade-in">Your gateway to exciting esports tournaments and gaming experiences.</p>
      </div>
      <div className="info-section">
        <div className="info-card bounce-in">
          <h2>Compete and Win</h2>
          <p>Join our tournaments and test your skills against players from around the world. Exciting prizes await!</p>
        </div>
        <div className="info-card bounce-in">
          <h2>Game Categories</h2>
          <p>Explore a wide range of game categories including FPS, MOBA, and more. Find your favorite game and start competing!</p>
        </div>
        <div className="info-card bounce-in">
          <h2>Community</h2>
          <p>Connect with fellow gamers, form teams, and share your gaming experiences. Join our vibrant community today!</p>
        </div>
      </div>
      <footer className="footer fade-in">
        <p>&copy; 2024 Esports Platform. All rights reserved.</p>
        <div className="footer-links">
          <a href="/about" className="footer-link">About Us</a>
          <a href="/contact" className="footer-link">Contact</a>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
