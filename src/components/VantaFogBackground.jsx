import { useEffect, useRef, useState } from "react";
import "./VantaFogBackground.css";

function shouldUseFog() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smallScreen = window.matchMedia("(max-width: 860px)").matches;
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
  const lowCpu = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  return !reducedMotion && !smallScreen && !lowMemory && !lowCpu;
}

export default function VantaFogBackground() {
  const containerRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const updateCapability = () => setEnabled(shouldUseFog() && !document.hidden);
    updateCapability();
    window.addEventListener("resize", updateCapability);
    document.addEventListener("visibilitychange", updateCapability);
    return () => {
      window.removeEventListener("resize", updateCapability);
      document.removeEventListener("visibilitychange", updateCapability);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !containerRef.current) return undefined;

    let effect;
    let cancelled = false;

    async function createFog() {
      const [{ default: FOG }, THREE] = await Promise.all([
        import("vanta/dist/vanta.fog.min"),
        import("three"),
      ]);

      if (cancelled || !containerRef.current) return;
      effect = FOG({
        el: containerRef.current,
        THREE,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        highlightColor: 0x6d5dfc,
        midtoneColor: 0x1b2150,
        lowlightColor: 0x07090e,
        baseColor: 0x07090e,
        blurFactor: 0.65,
        speed: 2.75,
        zoom: 0.85,
      });
    }

    createFog();
    return () => {
      cancelled = true;
      effect?.destroy();
    };
  }, [enabled]);

  return <div ref={containerRef} className="vanta-fog" aria-hidden="true" />;
}
