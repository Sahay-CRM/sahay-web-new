import React from "react";
import { iconMap, type IconName } from "./iconMap";

interface LucideIconProps {
  name: IconName;
  className?: string;
  size?: number;
}

const LucideIcon: React.FC<LucideIconProps> = ({
  name,
  className = "",
  size = 20,
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    // eslint-disable-next-line no-console
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  return <IconComponent className={className} size={size} />;
};

export default LucideIcon;
