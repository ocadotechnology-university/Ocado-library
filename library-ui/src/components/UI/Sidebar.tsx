import type { ReactNode } from "react";
import "./Sidebar.css";

type SidebarProps = {
  children?: ReactNode;
};

const Sidebar = ({ children }: SidebarProps) => {
  return <div className="sidebar">{children}</div>;
};

export default Sidebar;
