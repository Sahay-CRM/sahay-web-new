import { useRef, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"; // adjust the path as per your project

export function TableTooltip({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setShowTooltip(el.offsetWidth < el.scrollWidth);
    }
  }, [text]);

  const content = (
    <div ref={ref} className="truncate">
      {text}
    </div>
  );

  return showTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    content
  );
}
