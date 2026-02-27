import { useCallback, useEffect, useRef } from "react";

/**
 * Returns pointer-event handlers that fire `callback` once on press,
 * then repeatedly while the pointer is held down.
 *
 * @param callback  Fired on each tick (initial press + repeats)
 * @param options.delay     Ms before repeating starts (default 400)
 * @param options.interval  Ms between repeats (default 80)
 */
export function useHoldRepeat(
    callback: () => void,
    options?: { delay?: number; interval?: number },
) {
    const { delay = 400, interval = 80 } = options ?? {};

    const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const callbackRef = useRef(callback);

    // Keep callback ref fresh so timers always call the latest version
    callbackRef.current = callback;

    const clear = useCallback(() => {
        if (delayRef.current !== null) {
            clearTimeout(delayRef.current);
            delayRef.current = null;
        }
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Clean up on unmount
    useEffect(() => clear, [clear]);

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            // Prevent text selection while holding
            e.preventDefault();

            // Fire immediately on press
            callbackRef.current();

            // After the initial delay, start repeating
            delayRef.current = setTimeout(() => {
                intervalRef.current = setInterval(
                    () => callbackRef.current(),
                    interval,
                );
            }, delay);
        },
        [delay, interval],
    );

    const onPointerUp = useCallback(() => clear(), [clear]);
    const onPointerLeave = useCallback(() => clear(), [clear]);

    return { onPointerDown, onPointerUp, onPointerLeave };
}
