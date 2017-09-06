import Phaser from 'phaser'
import _ from 'lodash'

class RandomGenerator extends Phaser.RandomDataGenerator {
    randomCell (probabilities) {
        const val = this.frac()
        let result
        let current = 0
        _.each(probabilities, (value, name) => {
            current += value
            if (val <= current) {
                result = name
                return false
            }
        })
        return result
    }
}

export default RandomGenerator
