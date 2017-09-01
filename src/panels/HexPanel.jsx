import React from 'react'

class HexPanel extends React.Component {
    render () {
        let hex = this.props.hex
        if (hex) {
            return <div>{hex.x}</div>
        }
        return <div>Click on hex to select</div>
    }
}

export default HexPanel
