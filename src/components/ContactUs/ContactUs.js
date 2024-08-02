// src/components/ContactUs/ContactUs.js
import React from 'react';
import './ContactUs.css';

const ContactUs = () => {
  return (
    <div className="contactus-container">
      <h1>Contact Us</h1>
      <p>We'd love to hear from you! Whether you have questions, feedback, or need support, feel free to reach out to us.</p>
      <form className="contact-form">
        <label>Name</label>
        <input type="text" placeholder="Your Name" />
        <label>Email</label>
        <input type="email" placeholder="Your Email" />
        <label>Message</label>
        <textarea placeholder="Your Message"></textarea>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ContactUs;
