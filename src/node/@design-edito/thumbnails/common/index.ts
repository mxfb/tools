export function randomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function randomIntRange(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export function shuffleArray(array: any[]) {
    return [...array].sort((a: any, b: any) => 0.5 - Math.random());
}

export function clampNumber(val: number, min: number, max: number) {
    return Math.max(min, Math.min(val, max))
}

export function getArrayMax(array: number[]) {
    if (!array.length || !array[0]) { return; }

    let max = array[0];
    for (let i = 0; i < array.length; i++) {
        const current = array[i];
        if (current !== undefined && current > max) {
            max = current;
        }
    }

    return max;
}