export function mix( x, y, a ) {
    return x * ( 1 - a ) + y * a;
}

export function remap( x, oMin, oMax, nMin, nMax ) {
    return mix( nMin, nMax, ( x - oMin ) / ( oMax - oMin ) );
}

export function simplexNoise4d( x, y, z, w ) {
    return simplex.noise4d( x, y, z, w );
}
