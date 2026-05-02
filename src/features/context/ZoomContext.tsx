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
const ZOOM_MANUAL_FLAG = "CRM_UI_ZOOM_MANUAL";
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
  const calculateAutoZoom = useCallback(() => {
    if (typeof window === "undefined") return ZOOM_DEFAULT;
    const width = window.innerWidth;
    if (width >= 1920) return 100;
    // Scale down proportionally base on 1920 screen size
    const calculated = Math.round((width / 1920) * 100);
    return Math.min(Math.max(calculated, ZOOM_MIN), ZOOM_MAX);
  }, []);

  const [zoom, setZoom] = useState<number>(() => {
    const isManual = localStorage.getItem(ZOOM_MANUAL_FLAG) === "true";
    if (isManual) {
      const stored = localStorage.getItem(ZOOM_STORAGE_KEY);
      if (stored) {
        const parsed = Number(stored);
        if (!isNaN(parsed)) {
          return Math.min(Math.max(parsed, ZOOM_MIN), ZOOM_MAX);
        }
      }
    }
    return calculateAutoZoom();
  });

  // Handle auto scaling on window resize if not manually locked
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const isManual = localStorage.getItem(ZOOM_MANUAL_FLAG) === "true";
        if (!isManual) {
          setZoom(calculateAutoZoom());
        }
      }, 100); // 100ms debounce
    };

    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [calculateAutoZoom]);

  // Root font-size scaling is handled by CSS zoom in DashboardLayout
  // useEffect(() => {
  //   const pct = zoom / 100;
  //   document.documentElement.style.fontSize = `${pct * 16}px`;
  // }, [zoom]);

  const zoomIn = useCallback(() => {
    localStorage.setItem(ZOOM_MANUAL_FLAG, "true");
    setZoom((prev) => {
      const newZoom = Math.min(prev + ZOOM_STEP, ZOOM_MAX);
      localStorage.setItem(ZOOM_STORAGE_KEY, String(newZoom));
      return newZoom;
    });
  }, []);

  const zoomOut = useCallback(() => {
    localStorage.setItem(ZOOM_MANUAL_FLAG, "true");
    setZoom((prev) => {
      const newZoom = Math.max(prev - ZOOM_STEP, ZOOM_MIN);
      localStorage.setItem(ZOOM_STORAGE_KEY, String(newZoom));
      return newZoom;
    });
  }, []);

  const resetZoom = useCallback(() => {
    // Revert back to proportional auto-scaling mode
    localStorage.removeItem(ZOOM_MANUAL_FLAG);
    localStorage.removeItem(ZOOM_STORAGE_KEY);
    setZoom(calculateAutoZoom());
  }, [calculateAutoZoom]);

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
