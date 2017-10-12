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
    constructor ({ i, j, resources, cell }) {
        this.i = i
        this.j = j
        this.resources = resources
        this.cell = cell
        this.neighbors = []

        this.resourcesDelta = {}
        _.each(this.resources, (value, key) => {
            this.resourcesDelta[key] = 0
        })
    }

    setNeighbors (neighbors) {
        this.neighbors = neighbors
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
                this.cell.applyReactions(delta, this)
            }
        }
    }

    applyUpdate (delta) {
        _.each(this.resourcesDelta, (value, key) => {
            this.resources[key] += value
            this.resourcesDelta[key] = 0
        })

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
}

// This Hex is used as outside neighbor, so all hexes have six neighbors
// Does not keep any resources and cells, just to have proper calculations
class OutsideHex extends Hex {
    calcUpdate (delta) {}
    applyUpdate (delta) {}
    applyReaction (reaction, delta) {}
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
        resources.list.forEach((item) => {
            this.resources[item.name] = new Resource(item)
        })

        this.cells = {}
        cells.list.forEach((item, index) => {
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
        this.layer.forEach(function (hex) {
            hex.calcUpdate(delta)
        })

        this.layer.forEach(function (hex) {
            hex.applyUpdate(delta)
        })

        this.layer.forEach(function (hex) {
            hex.removeDeadCell(delta)
        })
    }

    initialize () {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let cell
                const cellName = this.rnd.randomCell(this.cellsConfig.initial)

                if (cellName) {
                    cell = this.cells[cellName].create()
                }
                const hex = new Hex({
                    i: i,
                    j: j,
                    resources: Object.assign({}, this.resourcesConfig.initial),
                    cell: cell,
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
