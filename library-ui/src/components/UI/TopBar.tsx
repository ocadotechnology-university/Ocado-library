import logo from "../../assets/ocado_technology_logo.jpeg";

const actionButtonClass = [
  "inline-flex min-h-10 min-w-10 items-center justify-center",
  "rounded-lg border-2 border-[#9e9eae] bg-[#eeeef0]",
  "px-2.5 py-2 text-lg",
  "shadow-[0_2px_0_0_rgb(67_72_94_/0.35),0_4px_12px_-2px_rgb(0_0_0_/0.35)]",
  "transition",
  "hover:border-[#43485e] hover:bg-white",
  "hover:shadow-[0_2px_0_0_rgb(67_72_94_/0.45),0_6px_16px_-4px_rgb(0_0_0_/0.4)]",
  "active:translate-y-px active:shadow-[0_1px_0_0_rgb(67_72_94_/0.35)]",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
  "focus-visible:outline-[#eeeef0]",
].join(" ");

type TopBarProps = {
  onAccountClick?: () => void;
  accountPanelOpen?: boolean;
};

const TopBar = ({ onAccountClick, accountPanelOpen = false }: TopBarProps) => {
  return (
    <div className="flex h-full w-full items-center justify-between gap-3 px-5 py-2 sm:px-8 lg:px-10">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <img
          src={logo}
          alt=""
          className="h-11 w-auto shrink-0 object-contain sm:h-12 lg:h-[3.25rem]"
          width={180}
          height={56}
        />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-[#eeeef0] sm:text-xl">
            Ocado Library
          </h1>
          <p className="hidden text-xs text-[#9e9eae] sm:block">Browse and manage resources</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button type="button" className={actionButtonClass} aria-label="Notifications">
          🔔
        </button>
        <button
          type="button"
          className={actionButtonClass}
          aria-label="Account"
          aria-expanded={accountPanelOpen}
          aria-haspopup="dialog"
          onClick={() => onAccountClick?.()}
        >
          👤
        </button>
      </div>
    </div>
  );
};

export default TopBar;
