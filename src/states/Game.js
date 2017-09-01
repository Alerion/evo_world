import Phaser from 'phaser'
import ReactDOM from 'react-dom'
import React from 'react'
import HexTile from '../sprites/HexTile'
import HexPanel from '../panels/HexPanel'

// FIXME: Refactor this copy-pasted shit code
let hexTileHeight = 61 // this is for horizontal
let hexTileWidth = Math.sqrt(3) / 2 * hexTileHeight // for horizontal
let hexGrid

export default class extends Phaser.State {
    init () {
        this.selectedHex = null
        this.panel = document.getElementById('panel')
    }

    create () {
        // TODO: Move to HexTileLayer class
        hexGrid = this.game.add.group()

        let verticalOffset = hexTileHeight * 3 / 4
        let horizontalOffset = hexTileWidth
        let startX
        let startY
        let startXInit = hexTileWidth / 2
        let startYInit = hexTileHeight / 2
        let world = this.game.gameWorld
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
                    game: this.game,
                    x: startX,
                    y: startY,
                    asset: 'hex',
                    isVertical: false,
                    hex: world.layer.get(i, j),
                })
                hexGrid.add(hexTile)

                startX += horizontalOffset
            }
        }

        hexGrid.x = 5
        hexGrid.y = 5

        hexGrid.inputEnableChildren = true
        hexGrid.onChildInputDown.add(this.selectHex, this)
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
}
