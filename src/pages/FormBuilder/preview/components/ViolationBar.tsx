import { AlertCircle } from "lucide-react";

interface ViolationCounts {
  tab_switch: number;
  focus_loss: number;
  fullscreen_exit: number;
}

interface ViolationBarProps {
  counts: ViolationCounts;
}

const ViolationBar = ({ counts }: ViolationBarProps) => {
  const totalViolations =
    counts.tab_switch + counts.focus_loss + counts.fullscreen_exit;

  if (totalViolations === 0) return null;

  const alerts: string[] = [];
  if (counts.tab_switch > 0) alerts.push(`${counts.tab_switch} Tab Switches`);
  if (counts.focus_loss > 0) alerts.push(`${counts.focus_loss} Focus Losses`);
  if (counts.fullscreen_exit > 0)
    alerts.push(`${counts.fullscreen_exit} Fullscreen Exits`);

  return (
    <div className="bg-orange-50 border-b border-orange-200 px-6 py-2 flex items-center justify-between z-40">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-orange-600" />
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-orange-700 uppercase tracking-wider">
            Proctoring Warning:
          </span>
          {alerts.map((alert, idx) => (
            <span
              key={idx}
              className="text-[11px] font-bold text-orange-600 bg-orange-100/50 px-2 py-0.5 rounded-md"
            >
              {alert}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[10px] font-bold text-orange-500 italic">
        Violation limits active. Avoid further switching.
      </p>
    </div>
  );
};

export default ViolationBar;
