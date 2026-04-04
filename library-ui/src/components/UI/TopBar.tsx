import "./TopBar.css";
import logo from "../../assets/ocado_technology_logo.jpeg";

const TopBar = () => {
  return (
    <div className="top-bar-inner">
      <div className="top-bar-left">
        <img src={logo} alt="Logo" className="logo" />
        <span className="title">Ocado Library</span>
      </div>
      <div className="top-bar-right">
        <button type="button" className="notification-button" aria-label="Notifications">
          🔔
        </button>
        <button type="button" className="account-button" aria-label="Account">
          👤
        </button>
      </div>
    </div>
  );
};

export default TopBar;
