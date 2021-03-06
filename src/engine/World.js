import _ from 'lodash'
import CellFactory from './CellFactory.js'
import Resource from './Resource.js'
import RandomGenerator from '../random.js'

const COLORS = [
    0x8dd3c7, 0xffffb3, 0xbebada, 0xfb8072, 0x80b1d3, 0xfdb462, 0xb3de69, 0xfccde5, 0xd9d9d9,
    0xbc80bd, 0xccebc5, 0xffed6f,
]

/* const COLORS = [
    0xa6cee3, 0x1f78b4, 0xb2df8a, 0x33a02c, 0xfb9a99, 0xe31a1c, 0xfdbf6f, 0xff7f00,
    0xcab2d6, 0x6a3d9a, 0xffff99, 0xb15928,
] */

class Hex {
    constructor ({ i, j, resources, cell, resourcesConfig }) {
        this.i = i
        this.j = j
        this.resourcesConfig = resourcesConfig
        this.resources = resources
        this.cell = cell
        this.neighbors = []

        this.resourcesDelta = {}
        this.resetResourcesDelta()
    }

    setNeighbors (neighbors) {
        this.neighbors = _.filter(neighbors, (hex) => {
            return hex.resources
        })
    }

    calcUpdate (delta) {
        if (this.cell) {
            // Division
            let divided = false
            if (this.cell.canDivide()) {
                const freeCells = _.filter(this.neighbors, (hex) => {
                    return !hex.cell
                })

                if (!_.isEmpty(freeCells)) {
                    const newCellHex = _.shuffle(freeCells)[0]
                    newCellHex.cell = this.cell.divide()
                    divided = true
                }
            }

            // Reactions
            if (!divided) {
                this.cell.fillStorage(delta, this)
                this.cell.applyReactions(delta, this)
            }
        }
    }

    applyUpdate (delta) {
        _.each(this.resourcesDelta, (value, key) => {
            this.resources[key] += value
            console.assert(this.resources[key] >= 0, `Resource ${key} is negative value = ${this.resources[key]}, delta = ${value}.`)
        })

        this.resetResourcesDelta()
    }

    applyCellUpdate (delta) {
        if (this.cell) {
            this.cell.applyUpdate(delta)
            // Death
            // FIXME: Move to other method?
            if (this.cell.canDie()) {
                this.cell.die()
            }
        }
    }

    removeDeadCell () {
        if (this.cell && this.cell.isDead) {
            // Cell left all resources after death
            _.each(this.cell.resources, (value, key) => {
                this.resources[key] += value
            })
            this.cell = null
        }
    }

    calcDiffusion (delta) {
        const NEIGHBORS_COUNT = 6
        _.each(this.resources, (value, key) => {
            if (this.resourcesConfig[key].isEnergy) {
                return
            }

            const maxSpeed = this.resourcesConfig[key].diffusionSpeed
            _.each(this.neighbors, (hex) => {
                const R1 = this.resources[key]
                const R2 = hex.resources[key]
                let concentration = 0
                if (R1 + R2 !== 0) {
                    concentration = (R1 - R2) / (R1 + R2)
                }
                const speed = Math.min(maxSpeed, Math.abs(R1 - R2) / 2)
                this.resourcesDelta[key] += -speed * concentration / NEIGHBORS_COUNT * delta
            })
        })
    }

    resetResourcesDelta () {
        _.each(this.resources, (value, key) => {
            this.resourcesDelta[key] = 0
        })
    }
}

// This Hex is used as outside neighbor, so all hexes have six neighbors
// Does not keep any resources and cells, just to have proper calculations
class OutsideHex extends Hex {
    calcUpdate (delta) {}
    applyUpdate (delta) {}
    applyCellUpdate (delta) {}
    applyReaction (reaction, delta) {}
    calcDiffusion (delta) {}
    removeDeadCells () {}
}

class HexCollection {
    constructor ({ width, height }) {
        this.width = width
        this.height = height
        this.items = []

        for (let i = 0; i < height; i++) {
            this.items.push(new Array(width).fill(null))
        }
    }

    updateNeighbors () {
        this.forEach((hex) => {
            hex.setNeighbors(this.getNeighbors(hex))
        })
    }

    get (i, j) {
        return this.items[i] && this.items[i][j]
    }

    set (i, j, item) {
        this.items[i][j] = item
    }

    forEach (callback, context) {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                callback.call(context, this.get(i, j), i, j, this)
            }
        }
    }

    getNeighbors ({ i, j, hex }) {
        if (hex) {
            i = hex.i
            j = hex.j
        }

        const directions = [[0, -1], [1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0]]
        return _.map(directions, (item) => {
            let neighbor = this.get(i + item[0], j + item[1])
            if (_.isEmpty(neighbor)) {
                neighbor = new OutsideHex({
                    i: i + item[0],
                    j: j + item[1],
                })
            }
            return neighbor
        })
    }
}

class World {
    // Arguments example you can find in config.js
    constructor ({ seed, width, height, resources, cells }) {
        this.seed = seed
        this.width = width
        this.height = height
        this.cellsConfig = cells
        this.resourcesConfig = resources
        this.rnd = new RandomGenerator(seed)
        this.rnd.sow(this.seed)

        this.resources = {}
        _.each(resources, (item, name) => {
            this.resources[name] = new Resource(item)
        })

        this.cells = {}
        _.each(_.values(cells), (item, index) => {
            this.cells[item.name] = new CellFactory({
                config: item,
                resourcesConfig: this.resourcesConfig,
                color: COLORS[index],
            })
        })

        this.layer = new HexCollection({ width, height })
        this.initialize()
    }

    update (delta) {
        // World is updated in two steps. At first all changes are calculated.
        // Then changes are applied. This way only current values are used form
        // calculation and we avoid situation, when next hex use already updated
        // values from previous hex.
        this.layer.forEach((hex) => {
            hex.calcUpdate(delta)
        })

        this.layer.forEach((hex) => {
            hex.applyUpdate(delta)
        })

        this.layer.forEach((hex) => {
            hex.applyCellUpdate(delta)
        })

        this.layer.forEach((hex) => {
            hex.removeDeadCell(delta)
        })

        // Diffusion
        let sum1 = 0
        this.layer.forEach((hex) => {
            sum1 += hex.resources.A
        })

        this.layer.forEach((hex) => {
            hex.calcDiffusion(delta)
        })

        this.layer.forEach((hex) => {
            hex.applyUpdate(delta)
        })

        let sum2 = 0
        this.layer.forEach((hex) => {
            sum2 += hex.resources.A
        })
        console.assert(Math.abs(sum1 - sum2) < 0.0001, 'Not equal resources after diffusion')
    }

    initialize () {
        const resourcesInitial = {}
        _.each(this.resourcesConfig, (item) => {
            resourcesInitial[item.name] = item.initial
        })

        const cellsProbability = {}
        _.each(this.cellsConfig, (item) => {
            cellsProbability[item.name] = item.initial
        })

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let cell
                const cellName = this.rnd.randomCell(cellsProbability)

                if (cellName) {
                    cell = this.cells[cellName].create()
                }

                const hex = new Hex({
                    i: i,
                    j: j,
                    resources: Object.assign({}, resourcesInitial),
                    cell: cell,
                    resourcesConfig: this.resourcesConfig,
                })
                this.layer.set(i, j, hex)
            }
        }
        this.layer.updateNeighbors()
    }

    reset () {
        this.rnd.sow(this.seed)
        this.initialize()
    }
}

export default World
