export default {
    // gameWidth: 760,
    // gameHeight: 760,
    localStorageName: 'phaseres6webpack',

    world: {
        seed: '1234567890',
        width: 10,
        height: 10,
        resources: {
            list: [{
                name: 'A',
                isEnergy: false,
            }, {
                name: 'B',
                isEnergy: false,
            }, {
                name: 'C',
                isEnergy: false,
            }, {
                name: 'e',
                isEnergy: true,
            }],
            initial: {
                A: 10,
                B: 10,
                C: 0,
            },
        },
        cells: {
            list: [{
                name: 'Rael',
                reactions: [{
                    // 2A + B => C
                    inputs: {
                        A: 2,
                        B: 1,
                    },
                    output: {
                        C: 1,
                    },
                }],
            }],
            initial: {
                Rael: 0.1,
            },
        },
    },
}
