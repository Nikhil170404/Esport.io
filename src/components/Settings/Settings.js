// src/components/Settings/Settings.js
import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [basicSettings, setBasicSettings] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    notifications: true,
    privacy: 'public',
  });

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicSettings({ ...basicSettings, [name]: value });
  };

  const handleAdvancedChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdvancedSettings({
      ...advancedSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Handle saving settings logic here
    console.log('Basic Settings:', basicSettings);
    console.log('Advanced Settings:', advancedSettings);
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      <p>Manage your account settings and preferences here.</p>

      <form className="settings-form" onSubmit={handleSave}>
        <section className="basic-settings">
          <h2>Basic Settings</h2>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={basicSettings.email}
              onChange={handleBasicChange}
              placeholder="Enter your new email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={basicSettings.password}
              onChange={handleBasicChange}
              placeholder="Enter your new password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={basicSettings.confirmPassword}
              onChange={handleBasicChange}
              placeholder="Confirm your new password"
            />
          </div>
        </section>

        <section className="advanced-settings">
          <h2>Advanced Settings</h2>
          <div className="form-group">
            <label htmlFor="notifications">
              <input
                type="checkbox"
                id="notifications"
                name="notifications"
                checked={advancedSettings.notifications}
                onChange={handleAdvancedChange}
              />
              Enable Notifications
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="privacy">Privacy Settings</label>
            <select
              id="privacy"
              name="privacy"
              value={advancedSettings.privacy}
              onChange={handleAdvancedChange}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>
        </section>

        <button type="submit" className="save-button">Save Settings</button>
      </form>
    </div>
  );
};

export default Settings;
