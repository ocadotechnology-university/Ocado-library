import logo from "../../assets/ocado_technology_logo.jpeg";

const actionButtonClass = [
  "inline-flex min-h-11 min-w-11 items-center justify-center",
  "rounded-xl border-2 border-[#9e9eae] bg-[#eeeef0]",
  "px-3 py-2.5 text-xl",
  "shadow-[0_2px_0_0_rgb(67_72_94_/0.35),0_4px_12px_-2px_rgb(0_0_0_/0.35)]",
  "transition",
  "hover:border-[#43485e] hover:bg-white",
  "hover:shadow-[0_2px_0_0_rgb(67_72_94_/0.45),0_6px_16px_-4px_rgb(0_0_0_/0.4)]",
  "active:translate-y-px active:shadow-[0_1px_0_0_rgb(67_72_94_/0.35)]",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
  "focus-visible:outline-[#eeeef0]",
].join(" ");

const TopBar = () => {
  return (
    <div className="flex h-full w-full items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12">
      <div className="flex min-w-0 items-center gap-4 sm:gap-5">
        <img
          src={logo}
          alt=""
          className="h-16 w-auto shrink-0 object-contain sm:h-[4.75rem] lg:h-[5.25rem]"
          width={180}
          height={56}
        />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-[#eeeef0] sm:text-[1.65rem]">
            Ocado Library
          </h1>
          <p className="hidden text-sm text-[#9e9eae] sm:block">Browse and manage resources</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button type="button" className={actionButtonClass} aria-label="Notifications">
          🔔
        </button>
        <button
          type="button"
          className={actionButtonClass}
          aria-label="Account"
        >
          👤
        </button>
      </div>
    </div>
  );
};

export default TopBar;
