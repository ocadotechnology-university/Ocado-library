import React from 'react';

const Layout = ({ topBar, 
    leftSidebar, 
    rightSidebar, 
    children }) => {
  return (
    <div className="layout">
      <header className="top-bar">{topBar}</header>
      <div className="main-content">
        <aside className="left-sidebar">{leftSidebar}</aside>
        <main className="content">{children}</main>
        <aside className="right-sidebar">{rightSidebar}</aside>
      </div>
    </div>
  );
};

export default Layout;