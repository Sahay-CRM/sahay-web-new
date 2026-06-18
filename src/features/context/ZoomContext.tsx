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

  const [zoomOffset, setZoomOffset] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const storedOffset = localStorage.getItem("CRM_UI_ZOOM_OFFSET");
    if (storedOffset) {
      const parsed = Number(storedOffset);
      if (!isNaN(parsed)) return parsed;
    }
    // Migration logic for old manual absolute zoom
    const isManual = localStorage.getItem(ZOOM_MANUAL_FLAG) === "true";
    if (isManual) {
      const storedAbs = localStorage.getItem(ZOOM_STORAGE_KEY);
      if (storedAbs) {
        const parsedAbs = Number(storedAbs);
        if (!isNaN(parsedAbs)) {
          const auto = calculateAutoZoom();
          const offset = parsedAbs - auto;
          localStorage.removeItem(ZOOM_MANUAL_FLAG);
          localStorage.removeItem(ZOOM_STORAGE_KEY);
          localStorage.setItem("CRM_UI_ZOOM_OFFSET", String(offset));
          return offset;
        }
      }
    }
    return 0;
  });

  const [zoom, setZoom] = useState<number>(() => {
    const auto = calculateAutoZoom();
    return Math.min(Math.max(auto + zoomOffset, ZOOM_MIN), ZOOM_MAX);
  });

  // Handle auto scaling on window resize/zoom changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const auto = calculateAutoZoom();
        setZoom(Math.min(Math.max(auto + zoomOffset, ZOOM_MIN), ZOOM_MAX));
      }, 100); // 100ms debounce
    };

    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [calculateAutoZoom, zoomOffset]);

  // Root font-size scaling is handled by CSS zoom in DashboardLayout
  // useEffect(() => {
  //   const pct = zoom / 100;
  //   document.documentElement.style.fontSize = `${pct * 16}px`;
  // }, [zoom]);

  const zoomIn = useCallback(() => {
    setZoomOffset((prevOffset) => {
      const auto = calculateAutoZoom();
      const currentZoom = auto + prevOffset;
      const newZoom = Math.min(currentZoom + ZOOM_STEP, ZOOM_MAX);
      const newOffset = newZoom - auto;
      localStorage.setItem("CRM_UI_ZOOM_OFFSET", String(newOffset));
      setZoom(newZoom);
      return newOffset;
    });
  }, [calculateAutoZoom]);

  const zoomOut = useCallback(() => {
    setZoomOffset((prevOffset) => {
      const auto = calculateAutoZoom();
      const currentZoom = auto + prevOffset;
      const newZoom = Math.max(currentZoom - ZOOM_STEP, ZOOM_MIN);
      const newOffset = newZoom - auto;
      localStorage.setItem("CRM_UI_ZOOM_OFFSET", String(newOffset));
      setZoom(newZoom);
      return newOffset;
    });
  }, [calculateAutoZoom]);

  const resetZoom = useCallback(() => {
    localStorage.removeItem("CRM_UI_ZOOM_OFFSET");
    localStorage.removeItem(ZOOM_MANUAL_FLAG);
    localStorage.removeItem(ZOOM_STORAGE_KEY);
    setZoomOffset(0);
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
