import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const ZOOM_STORAGE_KEY = "CRM_UI_ZOOM_LEVEL";
const ZOOM_MIN = 50;
const ZOOM_MAX = 150;
const ZOOM_STEP = 5;
const ZOOM_DEFAULT = 100;

interface ZoomContextType {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

export function ZoomProvider({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState<number>(() => {
    const stored = localStorage.getItem(ZOOM_STORAGE_KEY);
    if (stored) {
      const parsed = Number(stored);
      return isNaN(parsed)
        ? ZOOM_DEFAULT
        : Math.min(Math.max(parsed, ZOOM_MIN), ZOOM_MAX);
    }
    // For first-time visitors, adjust based on screen width
    if (typeof window !== "undefined") {
      if (window.innerWidth < 1024) return 85;
      if (window.innerWidth < 1280) return 90;
    }
    return ZOOM_DEFAULT;
  });

  // Handle responsive zoom out on window resize
  useEffect(() => {
    const handleResize = () => {
      // We only auto-adjust if no manual zoom preference is stored or if it's currently at a default-ish level
      // This prevents overriding users who specifically want high zoom on small screens
      const stored = localStorage.getItem(ZOOM_STORAGE_KEY);
      if (!stored) {
        if (window.innerWidth < 1024) {
          setZoom(85);
        } else if (window.innerWidth < 1280) {
          setZoom(90);
        } else {
          setZoom(100);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Apply zoom to the root font-size so rem-based spacing scales too
  useEffect(() => {
    const pct = zoom / 100;
    document.documentElement.style.fontSize = `${pct * 16}px`;
    localStorage.setItem(ZOOM_STORAGE_KEY, String(zoom));
  }, [zoom]);

  const zoomIn = useCallback(
    () => setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX)),
    [],
  );

  const zoomOut = useCallback(
    () => setZoom((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN)),
    [],
  );

  const resetZoom = useCallback(() => setZoom(ZOOM_DEFAULT), []);

  const value = useMemo<ZoomContextType>(
    () => ({
      zoom,
      zoomIn,
      zoomOut,
      resetZoom,
      canZoomIn: zoom < ZOOM_MAX,
      canZoomOut: zoom > ZOOM_MIN,
    }),
    [zoom, zoomIn, zoomOut, resetZoom],
  );

  return <ZoomContext.Provider value={value}>{children}</ZoomContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useZoom() {
  const ctx = useContext(ZoomContext);
  if (!ctx) throw new Error("useZoom must be used inside <ZoomProvider>");
  return ctx;
}
