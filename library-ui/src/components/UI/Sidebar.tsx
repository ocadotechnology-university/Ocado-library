import React from 'react';
import './Sidebar.css'; // Assuming you will style it in a CSS file

const Sidebar = ({ children }) => {
  return <div className="sidebar">{children}</div>;
};

export default Sidebar;