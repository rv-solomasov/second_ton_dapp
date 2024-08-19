import { useEffect, useCallback } from "react";

// Custom Hook: useDebouncedEffect
export const useDebouncedEffect = (
    effect: () => void,
    deps: any[],
    delay: number
) => {
    const callback = useCallback(effect, deps);

    useEffect(() => {
        const handler = setTimeout(() => {
            callback();
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [callback, delay]);
};
