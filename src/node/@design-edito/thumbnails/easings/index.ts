/* Using https://github.com/AndrewRayCode/easing-utils/blob/master/src/easing.js */

export function ease(t: number, name: string) {
    switch(name) {
        case 'in-sine':
        return easeInSine(t);
        case 'out-sine':
        return easeOutSine(t);
        case 'in-out-sine':
        return easeInOutSine(t);
        case 'in-quad':
        return easeInQuad(t);
        case 'out-quad':
        return easeOutQuad(t);
        case 'in-out-quad':
        return easeInOutQuad(t);
        case 'linear':
        default:
        return linear(t);
    }
}

// No easing, no acceleration
export function linear( t: number ) {
    return t;
}

// Slight deceleration at the end
export function easeOutSine( t: number ) {
    return Math.sin( t * ( Math.PI / 2 ) );
}

// Slight acceleration from zero to full speed
export function easeInSine( t: number ) {
    return -1 * Math.cos( t * ( Math.PI / 2 ) ) + 1;
}

// Slight acceleration at beginning and slight deceleration at end
export function easeInOutSine( t: number ) {
    return -0.5 * ( Math.cos( Math.PI * t ) - 1 );
}

// Accelerating from zero velocity
export function easeInQuad( t: number ) {
    return t * t;
}

// Decelerating to zero velocity
export function easeOutQuad( t: number ) {
    return t * ( 2 - t );
}

// Acceleration until halfway, then deceleration
export function easeInOutQuad( t: number ) {
    return t < 0.5 ? 2 * t * t : - 1 + ( 4 - 2 * t ) * t;
}