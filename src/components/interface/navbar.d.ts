interface NavItemChild {
  id: number;
  label: string;
  link: string;
  permission: string;
  moduleKey: string;
}

interface NavItem {
  id: number;
  icon: string;
  label: string;
  link?: string;
  permission: string;
  moduleKey?: string | string[];
  items?: NavItemChild[];
  moduleKey: string;
}

interface VerticalNavBarProps {
  isExpanded: boolean;
  data: NavItem[];
  onToggleDrawer?: () => void;
}

interface FullNavBarProps {
  data: NavItem[];
}
