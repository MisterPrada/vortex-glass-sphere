export default [
    // {
    //     name: 'exampleSound',
    //     type: 'audio',
    //     path: '/sounds/example.mp3'
    // },
    // {
    //     name: 'exampleModel',
    //     type: 'gltfModel',
    //     path: '/models/example.glb'
    // },
    // {
    //     name: 'exampleModel',
    //     type: 'gltfModel',
    //     path: '/models/points_3.glb',
    //     meta: {
    //         "type": "gltfModel"
    //     }
    // },
    // {
    //     name: 'exampleAttribute',
    //     type: 'json',
    //     path: '/models/attr.json',
    //     meta: {
    //         "type": "json"
    //     }
    // },
    {
        name: 'displacementTexture',
        type: 'texture',
        obfuscate: true,
        path: '/textures/displacement.jpg',
        meta: {
            "type": "texture"
        }
    },
    {
        name: 'gradientTexture',
        type: 'texture',
        obfuscate: true,
        path: '/textures/background.png',
        meta: {
            "type": "texture"
        }
    },
    {
        name: 'hdriTexture',
        type: 'rgbeTexture',
        obfuscate: true,
        path: '/textures/hdri/rogland_clear_night_1k.hdr',
        meta: {
            "type": "rgbeTexture"
        }
    }
]
