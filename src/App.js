import React, {Component} from 'react';
import Barcode from './Barcode';

class App extends Component {
  state = {
    code: window.localStorage.getItem('code'),
    input: '',
  };

  updateCode(code) {
    window.localStorage.setItem('code', code);
    this.setState({code});
  }

  renderInput() {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          this.updateCode(this.state.input);
        }}>
        <input
          value={this.state.input}
          type="number"
          placeholder="Code"
          onChange={e => this.setState({input: e.target.value})}
        />
        <button type="submit">Set Code</button>
        <p>
          The number below the barcode on the small plastic card you get when
          you first register with Rainbow Rocket.
        </p>
      </form>
    );
  }

  renderBarcode() {
    const {code} = this.state;
    return (
      <>
        <div>
          <Barcode code={code} />
        </div>
        <button type="button" onClick={() => this.updateCode(null)}>
          Clear code
        </button>
      </>
    );
  }

  render() {
    const {code} = this.state;
    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '100vh',
          minWidth: '100vw',
        }}>
        {code ? this.renderBarcode() : this.renderInput()}
      </div>
    );
  }
}

export default App;
