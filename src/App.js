import React, {Component} from 'react';
import Barcode from './Barcode';

class App extends Component {
  state = {
    code: null,
    input: null,
  };

  componentDidMount() {
    this.setState({code: window.location.hash.substring(1)});
    window.addEventListener('hashchange', () =>
      this.setState({
        code: window.location.hash.substring(1),
      }),
    );
  }

  renderInput() {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          window.location.href = '#' + this.state.input;
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
        {code ? this.renderBarcode() : this.renderInput()}
      </div>
    );
  }
}

export default App;
