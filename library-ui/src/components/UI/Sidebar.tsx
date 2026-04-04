import type { ReactNode } from "react";

type SidebarProps = {
  children?: ReactNode;
};

const Sidebar = ({ children }: SidebarProps) => {
  return <div className="min-w-40 p-4">{children}</div>;
};

export default Sidebar;
