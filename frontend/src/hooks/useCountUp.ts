import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 to `target` with an ease-out curve.
 * Returns the current interpolated value.
 */
export function useCountUp(target: number, durationMs = 900): number {
    const [value, setValue] = useState(0);
    const frame = useRef<number>(0);

    useEffect(() => {
        const clamped = Math.max(0, Math.min(1, target));
        const start = performance.now();

        const tick = (now: number) => {
            const t = Math.min((now - start) / durationMs, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(clamped * eased);
            if (t < 1) frame.current = requestAnimationFrame(tick);
        };

        frame.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame.current);
    }, [target, durationMs]);

    return value;
}
