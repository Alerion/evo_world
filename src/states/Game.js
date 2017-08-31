import Phaser from 'phaser'
import HexTile from '../sprites/HexTile'

// FIXME: Refactor this copy-pasted shit code
let hexTileHeight = 61 // this is for horizontal
let hexTileWidth = Math.sqrt(3) / 2 * hexTileHeight // for horizontal
let hexGrid

export default class extends Phaser.State {
  init () {}

  create () {
    // TODO: Move to HexTileLayer class
    hexGrid = this.game.add.group()

    let worldWidth = 10
    let worldHeight = 10
    let verticalOffset = hexTileHeight * 3 / 4
    let horizontalOffset = hexTileWidth
    let startX
    let startY
    let startXInit = hexTileWidth / 2
    let startYInit = hexTileHeight / 2

    let hexTile
    for (let i = 0; i < worldHeight; i++) {
      if (i % 2 !== 0) {
        startX = 2 * startXInit
      } else {
        startX = startXInit
      }
      startY = startYInit + (i * verticalOffset)
      for (let j = 0; j < worldWidth; j++) {
        hexTile = new HexTile({
          game: this.game,
          x: startX,
          y: startY,
          asset: 'hex',
          isVertical: false,
          i: i,
          j: j,
        })
        hexGrid.add(hexTile)

        startX += horizontalOffset
      }
    }

    hexGrid.x = 50
    hexGrid.y = 50
  }

  preload () {
    this.load.image('hex', 'assets/images/hexsmall.png')
  }

  render () {

  }
}
