uniform sampler2D baseTexture;
uniform sampler2D u_DepthTexture;
uniform sampler2D u_TransitionTexture;
uniform vec2 u_Resolution;
uniform vec4 u_TransitionTextureResolution;
uniform float u_TransitionProgress;
uniform float cameraNear;
uniform float cameraFar;
uniform bool u_ScreenShow;

varying vec2 vUv;

float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
    // -near maps to 0; -far maps to 1
    return ( viewZ + near ) / ( near - far );
}

float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
    // maps perspective depth in [ 0, 1 ] to viewZ
    return ( near * far ) / ( ( far - near ) * depth - far );
}

float readDepth( sampler2D depthSampler, vec2 coord ) {
    float fragCoordZ = texture2D( depthSampler, coord ).x;
    float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
    return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    float res = mix(
    mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
    mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
}

void main() {
    vec2 screenUV = gl_FragCoord.xy / u_Resolution;
    //float depth = readDepth( u_DepthTexture, screenUV );
    vec4 depth = texture2D( u_DepthTexture, vUv );
    vec4 prevTexture = texture2D( baseTexture, vUv );

    vec2 centerUv = (vUv - vec2(0.5))*u_TransitionTextureResolution.zw + vec2(0.5);
    vec4 transitionTexture = texture2D( u_TransitionTexture, centerUv );


    vec2 normalizeUv = screenUV;

    // Normalized pixel coordinates (from -1 to 1)
    normalizeUv *= 2.0;
    normalizeUv -= 1.0;

    // Fix resize window
    normalizeUv.x *= u_Resolution.x / u_Resolution.y;


    // smooth circle
    vec4 color = prevTexture;

    vec2 circleUv = normalizeUv;
    float dist = sdCircle(circleUv, 4.0 * u_TransitionProgress);

    bool inner = false;


    if ( dist < 0.0 ) {
        inner = true;
    }

    dist = abs(dist);
    dist = smoothstep(0.0, .7, dist);

    vec3 mask = color.rgb + transitionTexture.rgb;

    // change component RGB
    vec2 redShift = vec2(u_TransitionProgress * 0.1, 0.0);
    vec2 greenShift = vec2(0.0, -u_TransitionProgress * 0.1);
    vec2 blueShift = vec2(-u_TransitionProgress * 0.1, 0.0);

    vec4 red = texture(u_TransitionTexture, centerUv + redShift);
    vec4 green = texture(u_TransitionTexture, centerUv + greenShift);
    vec4 blue = texture(u_TransitionTexture, centerUv + blueShift);

    vec3 maskRGB = vec3(mask.r - red.r, mask.g - green.g, mask.b - blue.b);
    maskRGB.g = 0.0;
    maskRGB.r = 0.0;
    maskRGB.b /= 2.0;

    mask = mix(texture2D( baseTexture, vUv * transitionTexture.r ).rgb, prevTexture.rgb, transitionTexture.r);
    mask = mix(mask, texture2D( baseTexture, vUv - transitionTexture.r ).rgb, u_TransitionProgress);
    mask = mix(mask, maskRGB, 0.5);
    mask = mix(mask, prevTexture.rgb, smoothstep(0.0, 1.0, u_TransitionProgress));

    if ( inner ) {
        gl_FragColor = mix(vec4( mask , 1.0), vec4(0.0), smoothstep(0.0, 1.0, dist));
    } else {
        if ( u_ScreenShow ) {
            gl_FragColor = mix(vec4(mask, 1.0), prevTexture, smoothstep(0.0, 1.0, dist));
            gl_FragColor.a = 1.0;
        } else {
            if( depth.r == 0.0 ) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            } else {
                gl_FragColor = prevTexture;
            }
        }
    }

    //gl_FragColor = vec4(0.0);


//    if ( depth.r == 0.0 ) {
//        discard;
//    } else {
//        gl_FragColor = prevTexture;
//    }

    //gl_FragColor.rgb = 1.0 - vec3( depth );
//    gl_FragColor.a = 1.0;
//
//    gl_FragColor = prevTexture;

    //gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
    //gl_FragColor = texture2D( baseTexture, vUv );

//    gl_FragColor.rgb = vec3( depth );
//    gl_FragColor.a = 1.0;

//    #include <tonemapping_fragment>
//    #include <colorspace_fragment>
}


