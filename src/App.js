import React, {Component} from 'react';
import Barcode from './Barcode';

class App extends Component {
  state = {
    code: null,
  };

  componentDidMount() {
    this.setState({code: window.location.hash.substring(1)});
    window.addEventListener('hashchange', () =>
      this.setState({
        code: window.location.hash.substring(1),
      }),
    );
  }

  renderHelp() {
    const {origin, pathname} = window.location;
    return (
      <p>
        To render a barcode change the hash of the page. I.e to render a barcode
        for the value <span style={{fontFamiliy: 'monospace'}}>TEST</span>{' '}
        navigate to {origin + pathname}
        #TEST
      </p>
    );
  }

  renderBarcode() {
    const {code} = this.state;
    return <Barcode code={code} />;
  }

  render() {
    const {code} = this.state;
    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          minHeight: '100vh',
          minWidth: '100vw',
        }}>
        {code ? this.renderBarcode() : this.renderHelp()}
      </div>
    );
  }
}

export default App;
