import React, {Component} from 'react';
import jsbarcode from 'jsbarcode';

export default class Barcode extends Component {
  canvas = React.createRef();

  updateCanvas() {
    const {current} = this.canvas;
    if (current) {
      jsbarcode(current, this.props.code, {
        format: 'CODE39',
      });
    }
  }

  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  render() {
    return <canvas ref={this.canvas} />;
  }
}
