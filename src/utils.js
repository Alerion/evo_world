import _ from 'lodash'

export const centerGameObjects = (objects) => {
    objects.forEach(function (object) {
        object.anchor.setTo(0.5)
    })
}

export const reactionToText = (reaction) => {
    const inputs = []
    _.each(reaction.inputs, (value, key) => {
        inputs.push(`${value}${key}`)
    })

    const output = []
    _.each(reaction.output, (value, key) => {
        output.push(`${value}${key}`)
    })

    return `${inputs.join(' + ')} = ${output.join(' + ')}`
}
