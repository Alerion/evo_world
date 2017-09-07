import _ from 'lodash'
import CellFactory from './CellFactory.js'
import Resource from './Resource.js'
import RandomGenerator from '../random.js'

class Hex {
    constructor ({ i, j, resources, cell }) {
        this.i = i
        this.j = j
        this.resources = resources
        this.cell = cell
    }

    update (delta) {
        if (this.cell) {
            _.each(this.cell.reactions, (reaction) => this.applyReaction(reaction, delta))
        }
    }

    applyReaction (reaction, delta) {
        const inputs = reaction.inputs
        const output = reaction.output
        const consumed = {}

        _.each(inputs, (value, key) => {
            const amount = value * delta
            if (this.resources[key] && this.resources[key] >= amount) {
                consumed[key] = amount
            } else {
                consumed[key] = 0
            }
        })

        if (_.every(_.values(consumed))) {
            _.each(consumed, (value, key) => {
                this.resources[key] -= value
            })

            _.each(output, (value, key) => {
                this.resources[key] += value * delta
            })
        }
    }
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

    get (i, j) {
        return this.items[i][j]
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
        cells.list.forEach((item) => {
            this.cells[item.name] = new CellFactory(item)
        })

        this.layer = new HexCollection({ width, height })
        this.initialize()
    }

    update (delta) {
        this.layer.forEach(function (hex) {
            hex.update(delta)
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
    }

    reset () {
        this.rnd.sow(this.seed)
        this.initialize()
    }
}

export default World
