import { float, vec3, cos, sin, Fn, normalize, max, color } from 'three/tsl';


const rotateZ = /*#__PURE__*/ Fn( ( [ v_immutable, angle_immutable ] ) => {

    const angle = float( angle_immutable ).toVar();
    const v = vec3( v_immutable ).toVar();
    const cosAngle = float( cos( angle ) ).toVar();
    const sinAngle = float( sin( angle ) ).toVar();

    return vec3( v.x.mul( cosAngle ).sub( v.y.mul( sinAngle ) ), v.x.mul( sinAngle ).add( v.y.mul( cosAngle ) ), v.z );

} ).setLayout( {
    name: 'rotateZ',
    type: 'vec3',
    inputs: [
        { name: 'v', type: 'vec3' },
        { name: 'angle', type: 'float' }
    ]
} );


const facture = Fn( ( [ vector_immutable ] ) => {

    const vector = vec3( vector_immutable ).toVar();
    const normalizedVector = vec3( normalize( vector ) ).toVar();

    return max( max( normalizedVector.x, normalizedVector.y ), normalizedVector.z );

} ).setLayout( {
    name: 'facture',
    type: 'float',
    inputs: [
        { name: 'vector', type: 'vec3' }
    ]
} );

const emission = Fn( ( [ color_immutable, strength_immutable ] ) => {

    const strength = float( strength_immutable ).toVar();
    const color = vec3( color_immutable ).toVar();

    return color.mul( strength );

} ).setLayout( {
    name: 'emission',
    type: 'vec3',
    inputs: [
        { name: 'color', type: 'vec3' },
        { name: 'strength', type: 'float' }
    ]
} );


export {
    rotateZ,
    emission,
    facture
}
