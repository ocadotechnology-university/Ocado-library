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
  /** Return to catalogue home (`/`) — parent may also close overlays. */
  onLogoClick?: () => void;
  onNotificationsClick?: () => void;
  notificationsPanelOpen?: boolean;
  onAccountClick?: () => void;
  accountPanelOpen?: boolean;
  roleBadgeText?: string | null;
};

const TopBar = ({
  onLogoClick,
  onNotificationsClick,
  notificationsPanelOpen = false,
  onAccountClick,
  accountPanelOpen = false,
  roleBadgeText = null,
}: TopBarProps) => {
  return (
    <div className="flex h-full w-full items-center justify-between gap-3 px-5 py-2 sm:px-8 lg:px-10">
      <button
        type="button"
        onClick={() => onLogoClick?.()}
        className="flex min-w-0 items-center gap-3 rounded-lg text-left transition hover:bg-white/5 sm:gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#eeeef0]"
        aria-label="Ocado Library — back to catalogue"
      >
        <img
          src={logo}
          alt=""
          className="h-11 w-auto shrink-0 object-contain sm:h-12 lg:h-[3.25rem]"
          width={180}
          height={56}
        />
        <div className="min-w-0">
          <span className="block truncate text-lg font-semibold tracking-tight text-[#eeeef0] sm:text-xl">
            Ocado Library
          </span>
          <span className="hidden items-center gap-2 text-xs text-[#9e9eae] sm:flex">
            <span>Browse and manage resources</span>
            {roleBadgeText ? (
              <span className="rounded-full border border-[#d4e157]/60 bg-[#d4e157]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#d4e157]">
                {roleBadgeText}
              </span>
            ) : null}
          </span>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          className={actionButtonClass}
          aria-label="Notifications"
          aria-expanded={notificationsPanelOpen}
          aria-haspopup="dialog"
          onClick={() => onNotificationsClick?.()}
        >
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
