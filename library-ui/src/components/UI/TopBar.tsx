import logo from "../../assets/ocado_technology_logo.jpeg";

const TopBar = () => {
  return (
    <div className="flex w-full items-center justify-between px-4 py-2">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="h-8 w-auto" />
        <span className="text-lg font-semibold">Ocado Library</span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="cursor-pointer rounded border-0 bg-transparent px-2 py-1 text-xl hover:bg-black/5"
          aria-label="Notifications"
        >
          🔔
        </button>
        <button
          type="button"
          className="cursor-pointer rounded border-0 bg-transparent px-2 py-1 text-xl hover:bg-black/5"
          aria-label="Account"
        >
          👤
        </button>
      </div>
    </div>
  );
};

export default TopBar;
