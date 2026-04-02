import React from 'react';
import './TopBar.css'; // Assuming you will style it in a CSS file
import logo from '../../assets/ocado_technology_logo.jpeg';

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <img src={logo} alt="Logo" className="logo" />
        <span className="title">Ocado Library</span>
      </div>
      <div className="top-bar-right">
        <button className="notification-button">🔔</button>
        <button className="account-button">👤</button>
      </div>
    </div>
  );
};

export default TopBar;