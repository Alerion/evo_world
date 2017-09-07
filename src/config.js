import _ from 'lodash'

const RESOURCES_MULTIPLIER = 10 // Scale values for readability

const CONFIG = {
    localStorageName: 'phaseres6webpack',
    updateDelay: 500, // ms

    world: {
        seed: '1234567890',
        width: 20,
        height: 20,
        resources: {
            // Reactions output is split to neighbor hexes. This values tells
            // what part of output is split to six neighbors. 0 - nothig split to neighbors,
            // 1 - all split and no output to current hex with cell.
            updateSplitRatio: 0.5,
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
            // Add all possible resources at least with 0
            initial: {
                A: 10,
                B: 10,
                C: 0,
                e: 0,
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
            }, {
                name: 'Oridi',
                reactions: [{
                    // C => 3e
                    inputs: {
                        C: 1,
                    },
                    output: {
                        e: 3,
                    },
                }],
            }],
            // Spawn probability
            initial: {
                Rael: 0.1,
                Oridi: 0.1,
            },
        },
    },
}

_.each(CONFIG.world.resources.initial, (value, key) => {
    CONFIG.world.resources.initial[key] = value * RESOURCES_MULTIPLIER
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
