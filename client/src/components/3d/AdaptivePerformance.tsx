import React, { useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';

/**
 * AdaptivePerformance
 * -------------------
 * Drop inside any <Canvas>.
 * 1. Watches real frame-rate via drei's PerformanceMonitor and imperatively scales
 *    the renderer's DPR between `minDpr` and `maxDpr` (zero React state updates).
 * 2. Pauses the WebGL render loop (`frameloop = 'never'`) whenever the browser tab
 *    is hidden (`visibilitychange`) so background tabs use 0% GPU/CPU.
 */
export const AdaptivePerformance: React.FC<{ minDpr?: number; maxDpr?: number }> = ({
  minDpr = 1,
  maxDpr = 1.75,
}) => {
  const setDpr = useThree((s) => s.setDpr);
  const setFrameloop = useThree((s) => s.setFrameloop);
  const ceiling = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, maxDpr) : 1;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const syncVisibility = () => {
      setFrameloop(document.hidden ? 'never' : 'always');
    };
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility);
      setFrameloop('always');
    };
  }, [setFrameloop]);

  const handleChange = useCallback(
    ({ factor }: { factor: number }) => {
      const next = Math.round((minDpr + (ceiling - minDpr) * factor) * 4) / 4;
      setDpr(Math.max(minDpr, Math.min(ceiling, next)));
    },
    [ceiling, minDpr, setDpr]
  );

  return (
    <PerformanceMonitor
      factor={1}
      flipflops={3}
      onChange={handleChange}
      onFallback={() => setDpr(minDpr)}
    />
  );
};

export default AdaptivePerformance;

