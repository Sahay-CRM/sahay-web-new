import FullNavBar from "./FullNavBar";
import IconNavBar from "./IconNavBar";

export default function VerticalNavBar({
  isExpanded,
  data,
  onToggleDrawer,
}: VerticalNavBarProps) {
  return (
    <div className="">
      {isExpanded ? (
        <FullNavBar data={data} />
      ) : (
        <IconNavBar data={data} onToggleExpanded={onToggleDrawer} />
      )}
    </div>
  );
}
