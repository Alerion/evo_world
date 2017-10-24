import _ from 'lodash'

const RESOURCES_MULTIPLIER = 10 // Scale values for readability

const CONFIG = {
    localStorageName: 'phaseres6webpack',
    updateDelay: 500, // ms

    world: {
        seed: '1234567890',
        width: 26,
        height: 20,
        resources: {
            list: {
                A: {
                    name: 'A',
                    isEnergy: false,
                    diffusionSpeed: 20,
                    initial: 10,
                },
                B: {
                    name: 'B',
                    isEnergy: false,
                    diffusionSpeed: 20,
                    initial: 10,
                },
                C: {
                    name: 'C',
                    isEnergy: false,
                    diffusionSpeed: 20,
                    initial: 10,
                },
                e: {
                    name: 'e',
                    isEnergy: true,
                    diffusionSpeed: 20,
                    initial: 0,
                },
            },
            // maxDispay - used to calculate color and opacity for resource
            maxDispay: {
                A: 20,
                B: 20,
                C: 20,
                e: 20,
            },
        },
        // Lets use Elfs female names http://www.fantasynamegenerators.com/dnd-elf-names.php
        // Just for mem
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
                divisionConditions: {
                    C: 30,
                },
                deathConditions: {
                    lifeTime: 5, // seconds
                },
            }, {
                name: 'Oridi',
                reactions: [{
                    // A + 2B => C
                    inputs: {
                        A: 1,
                        B: 2,
                    },
                    output: {
                        C: 1,
                    },
                }],
                divisionConditions: {
                    C: 30,
                },
                deathConditions: {
                    lifeTime: 5, // seconds
                },
            }, {
                name: 'Vendi',
                reactions: [{
                    // C => A + B
                    inputs: {
                        C: 2,
                    },
                    output: {
                        A: 1,
                        B: 1,
                    },
                }],
                divisionConditions: {
                    A: 30,
                    B: 30,
                },
                deathConditions: {
                    lifeTime: 4, // seconds
                },
            }],
            // Spawn probability
            initial: {
                Rael: 0.1,
                Oridi: 0.1,
                Vendi: 0.1,
            },
        },
    },
}

_.each(CONFIG.world.resources.maxDispay, (value, key) => {
    CONFIG.world.resources.maxDispay[key] = value * RESOURCES_MULTIPLIER
})

_.each(CONFIG.world.resources.list, (item) => {
    item.initial = item.initial * RESOURCES_MULTIPLIER
    item.diffusionSpeed = item.diffusionSpeed * RESOURCES_MULTIPLIER
})

_.each(CONFIG.world.cells.list, (cell) => {
    _.each(cell.reactions, (reaction) => {
        _.each(reaction.inputs, (value, key) => {
            reaction.inputs[key] = value * RESOURCES_MULTIPLIER
        })

        _.each(reaction.output, (value, key) => {
            reaction.output[key] = value * RESOURCES_MULTIPLIER
        })
    })
})

export default CONFIG
