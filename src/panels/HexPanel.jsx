import React from 'react'
import _ from 'lodash'
import numeral from 'numeral'

class HexPanel extends React.Component {
    render () {
        let button
        if (this.props.running) {
            button = <button className="btn btn-danger" onClick={this.props.stop}>Stop</button>
        } else {
            button = <button className="btn btn-success" onClick={this.props.start}>Start</button>
        }

        return <div>
            {button}
            <button className="btn btn-warning" onClick={this.props.reset}>Reset</button>
            {this.renderHex(this.props.hex)}
        </div>
    }

    renderHex (hex) {
        if (!hex) {
            return <div>Click on hex to select</div>
        }

        // FIXME: Use RESOURCES_MULTIPLIER for format
        const resources = _.map(hex.resources, (value, name) =>
            <li className="list-group-item" key={name}>
                {name} <span className="badge badge-default badge-pill">{numeral(value).format('0')}</span>
            </li>
        )

        let cell = ''
        if (hex.cell) {
            cell = <div>{hex.cell.name}</div>
        }

        return <div>
            <ul className="list-group">{resources}</ul>
            {cell}
        </div>
    }
}

export default HexPanel
