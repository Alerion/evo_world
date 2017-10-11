import Phaser from 'phaser'
import ReactDOM from 'react-dom'
import React from 'react'
import HexTile from '../sprites/HexTile'
import HexPanel from '../panels/HexPanel'

// FIXME: Refactor this copy-pasted shit code
let hexTileHeight = 60 // this is for horizontal
let hexTileWidth = Math.sqrt(3) / 2 * hexTileHeight // for horizontal

class Game extends Phaser.State {
    init () {
        this.selectedHex = null
        this.hexGrid = null
        this.panel = document.getElementById('panel')
        this.world = this.game.gameWorld

        this._mapWidth = null
        this._mapHeight = null
        this._updateWorldTimer = null
    }

    create () {
        const game = this.game

        this.initHexGrid()

        this._mapWidth = this.world.width * hexTileWidth + hexTileWidth / 2
        this._mapHeight = this.world.height * hexTileHeight * 0.75 + hexTileHeight * 0.25

        game.input.onDown.add(this._startDrag, this)

        this._updateWorldTimer = game.time.create({autoDestroy: false})
        this._updateWorldTimer.loop(game.config.updateDelay, this.updateWorld, this)

        this.renderHexPanel()
    }

    preload () {}

    update () {}

    render () {}

    updateWorld (event) {
        // It is not real delta between calls, but it does not matter for simulation.
        // Can be fixed later
        this.world.update(this.game.config.updateDelay / 1000)
        if (this.selectedHex) {
            this.renderHexPanel()
        }
    }

    renderHexPanel () {
        ReactDOM.render(
            React.createElement(
                HexPanel, {
                    hex: this.selectedHex,
                    start: this.startSimulation.bind(this),
                    stop: this.stopSimulation.bind(this),
                    reset: this.resetWorld.bind(this),
                    running: this._updateWorldTimer.running && !this._updateWorldTimer.paused,
                }
            ),
            this.panel)
    }

    initHexGrid () {
        // TODO: Move to HexTileLayer class
        const game = this.game
        const world = this.world

        if (this.hexGrid) {
            this.hexGrid.destroy()
        }
        this.hexGrid = game.add.group()

        let verticalOffset = hexTileHeight * 3 / 4
        let horizontalOffset = hexTileWidth
        let startX
        let startY
        let startXInit = hexTileWidth / 2
        let startYInit = hexTileHeight / 2
        let radius = hexTileHeight / 2

        let hexTile

        for (let i = 0; i < world.height; i++) {
            if (i % 2 !== 0) {
                startX = 2 * startXInit
            } else {
                startX = startXInit
            }
            startY = startYInit + (i * verticalOffset)
            for (let j = 0; j < world.width; j++) {
                hexTile = new HexTile({
                    game: game,
                    x: startX - radius,
                    y: startY - radius,
                    radius: radius,
                    hex: world.layer.get(i, j),
                })
                this.hexGrid.add(hexTile)

                startX += horizontalOffset
            }
        }

        this.hexGrid.inputEnableChildren = true
        this.hexGrid.onChildInputDown.add(this.selectHex, this)
    }

    resetWorld () {
        this.world.reset()
        this.initHexGrid()
        if (this.selectedHex) {
            this.selectedHex = this.world.layer.get(this.selectedHex.i, this.selectedHex.j)
        }
        this.renderHexPanel()
    }

    startSimulation () {
        if (this._updateWorldTimer.running) {
            this._updateWorldTimer.resume()
        } else {
            this._updateWorldTimer.start()
        }
        this.renderHexPanel()
    }

    stopSimulation () {
        this._updateWorldTimer.pause()
        this.renderHexPanel()
    }

    selectHex (hexTile) {
        this.selectedHex = hexTile.hex
        this.renderHexPanel()
    }

    _startDrag () {
        const game = this.game
        this._startX = game.input.worldX
        this._startY = game.input.worldY
        this.hexGrid.saveX = this.hexGrid.x
        this.hexGrid.saveY = this.hexGrid.y
        // updating listeners
        game.input.onDown.remove(this._startDrag, this)
        game.input.onUp.add(this._stopDrag, this)
        game.input.addMoveCallback(this._dragMap, this)
    }

    _dragMap () {
        const game = this.game
        const hexGrid = this.hexGrid
        const currentX = game.input.worldX
        const currentY = game.input.worldY
        const deltaX = this._startX - currentX
        const deltaY = this._startY - currentY

        hexGrid.x = hexGrid.saveX - deltaX
        hexGrid.y = hexGrid.saveY - deltaY
        // this is to limit map movement and always have the
        // stage fully covered by the map
        if (hexGrid.x < game.width - this._mapWidth) {
            hexGrid.x = game.width - this._mapWidth
        }
        if (hexGrid.x > 0) {
            hexGrid.x = 0
        }
        if (hexGrid.y < game.height - this._mapHeight) {
            hexGrid.y = game.height - this._mapHeight
        }
        if (hexGrid.y > 0) {
            hexGrid.y = 0
        }
    }

    // the player stops touching the map
    _stopDrag () {
        const game = this.game
        game.input.onDown.add(this._startDrag, this)
        game.input.onUp.remove(this._stopDrag, this)
        game.input.deleteMoveCallback(this._dragMap, this)
    }
}

export default Game
