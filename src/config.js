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
            A: {
                name: 'A',
                isEnergy: false,
                diffusionSpeed: 20,
                initial: 10,
                // maxDispay - used to calculate color and opacity for resource
                maxDispay: 15,
            },
            B: {
                name: 'B',
                isEnergy: false,
                diffusionSpeed: 20,
                initial: 10,
                maxDispay: 15,
            },
            C: {
                name: 'C',
                isEnergy: false,
                diffusionSpeed: 20,
                initial: 10,
                maxDispay: 15,
            },
            e: {
                name: 'e',
                isEnergy: true,
                diffusionSpeed: 20,
                initial: 0,
                maxDispay: 15,
            },
        },
        // Lets use Elfs female names http://www.fantasynamegenerators.com/dnd-elf-names.php
        // Just for mem
        cells: {
            Rael: {
                name: 'Rael',
                // Spawn probability
                initial: 0.1,
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
                // Cell stores resources for 10 turns reactions or division conditions.
                // Storage is filled with some rate.
                storeMaxTurns: 10,
            },
            Oridi: {
                name: 'Oridi',
                initial: 0.1,
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
                storeMaxTurns: 10,
            },
            Vendi: {
                name: 'Vendi',
                initial: 0.1,
                reactions: [{
                    // C => 1.5A + 1.5B
                    inputs: {
                        C: 1,
                    },
                    output: {
                        A: 1.5,
                        B: 1.5,
                    },
                }],
                divisionConditions: {
                    A: 45,
                    B: 45,
                },
                deathConditions: {
                    lifeTime: 4, // seconds
                },
                storeMaxTurns: 10,
            },
        },
    },
}

_.each(CONFIG.world.resources, (item) => {
    item.initial = item.initial * RESOURCES_MULTIPLIER
    item.diffusionSpeed = item.diffusionSpeed * RESOURCES_MULTIPLIER
    item.maxDispay = item.maxDispay * RESOURCES_MULTIPLIER
})

_.each(CONFIG.world.cells, (cell) => {
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
