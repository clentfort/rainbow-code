import React, {Component} from 'react';
import jsbarcode from 'jsbarcode';

class Barcode extends Component {
  canvas = React.createRef();

  componentDidMount() {
    const {current} = this.canvas;
    if (current) {
      jsbarcode(current, this.props.code, {
        format: 'CODE39',
      });
    }
  }

  render() {
    return <canvas ref={this.canvas} />;
  }
}

class App extends Component {
  render() {
    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          minHeight: "100vh",
          minWidth: "100vw",
        }}>
        <Barcode code="05606" />
      </div>
    );
  }
}

export default App;
