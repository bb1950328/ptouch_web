/**
 * Async function to sleep for `ms` amound of milliseconds.
 * @param ms - time to sleep in milliseconds
 * @returns `Promise<void>` after the sleep time has passed.
 * @see https://stackoverflow.com/a/75641376/8733066
 */
export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

export function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : {r: 0, g: 0, b: 0};
}