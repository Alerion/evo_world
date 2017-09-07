import 'pixi'
import 'p2'
import Phaser from 'phaser'

import GameState from './states/Game'
import World from './engine/World'
import config from './config'

class Game extends Phaser.Game {
    constructor () {
        const container = document.getElementById('content')
        const width = container.clientWidth > config.gameWidth ? config.gameWidth : container.clientWidth
        const height = container.clientHeight > config.gameHeight ? config.gameHeight : container.clientHeight

        super(width, height, Phaser.CANVAS, 'content', null, true)

        // FIXME: Phaser occupied best names
        this.config = config
        this.gameWorld = new World(config.world)
        // Used to render selected hex
        this.selectedHex = null

        this.state.add('Game', GameState)
        this.state.start('Game')
    }
}

window.game = new Game()
