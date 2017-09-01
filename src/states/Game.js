import Phaser from 'phaser'
import ReactDOM from 'react-dom'
import React from 'react'
import HexTile from '../sprites/HexTile'
import HexPanel from '../panels/HexPanel'

// FIXME: Refactor this copy-pasted shit code
let hexTileHeight = 61 // this is for horizontal
let hexTileWidth = Math.sqrt(3) / 2 * hexTileHeight // for horizontal

export default class extends Phaser.State {
    init () {
        this.selectedHex = null
        this.hexGrid = null
        this.panel = document.getElementById('panel')

        this._mapWidth = null
        this._mapHeight = null
    }

    create () {
        const game = this.game

        // TODO: Move to HexTileLayer class
        this.hexGrid = game.add.group()

        let verticalOffset = hexTileHeight * 3 / 4
        let horizontalOffset = hexTileWidth
        let startX
        let startY
        let startXInit = hexTileWidth / 2
        let startYInit = hexTileHeight / 2
        let world = game.gameWorld
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
                    x: startX,
                    y: startY,
                    asset: 'hex',
                    isVertical: false,
                    hex: world.layer.get(i, j),
                })
                this.hexGrid.add(hexTile)

                startX += horizontalOffset
            }
        }

        this._mapWidth = world.width * hexTileWidth + hexTileWidth / 2
        this._mapHeight = world.height * hexTileHeight * 0.75 + hexTileHeight * 0.25

        this.hexGrid.inputEnableChildren = true
        this.hexGrid.onChildInputDown.add(this.selectHex, this)

        game.input.onDown.add(this.startDrag, this)
    }

    preload () {
        this.load.image('hex', 'assets/images/hexsmall.png')
    }

    update (game) {
        game.gameWorld.update(game.time.physicsElapsed)
        if (this.selectedHex) {
            ReactDOM.render(
                React.createElement(HexPanel, {hex: this.selectedHex}),
                this.panel)
        }
    }

    render () {}

    selectHex (hexTile) {
        this.selectedHex = hexTile.hex
    }

    startDrag () {
        const game = this.game
        this._startX = game.input.worldX
        this._startY = game.input.worldY
        this.hexGrid.saveX = this.hexGrid.x
        this.hexGrid.saveY = this.hexGrid.y
        // updating listeners
        game.input.onDown.remove(this.startDrag, this)
        game.input.onUp.add(this.stopDrag, this)
        game.input.addMoveCallback(this.dragMap, this)
    }

    dragMap () {
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
    stopDrag () {
        const game = this.game
        game.input.onDown.add(this.startDrag, this)
        game.input.onUp.remove(this.stopDrag, this)
        game.input.deleteMoveCallback(this.dragMap, this)
    }
}
