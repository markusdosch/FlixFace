import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import './App.css';

import Home from './components/home';
import Check from './components/check';
import Add from './components/add';

class App extends Component {
  constructor() {
    super();
    this.state = {
      activeComponent: 1
    };
  }

  render() {
    let activeComponent;
    switch (this.state.activeComponent) {
      case 1:
        activeComponent = <Home/>;
        break;
      case 2:
        activeComponent = <Check/>;
        break;
      case 3:
        activeComponent = <Add/>;
        break;
      default:
        break;
    }

    return (
      <div className="App">
        <div className="App-header">
          <h2>FlixFace Beta</h2>
          <Nav bsStyle="pills" activeKey={this.state.activeComponent} onSelect={this.handleSelect}>
            <NavItem eventKey={1}>Check Entrance</NavItem>
            <NavItem eventKey={2}>Check Entrance</NavItem>
            <NavItem eventKey={3}>Add User</NavItem>
          </Nav>
        </div>

        {activeComponent}
      </div>
    );
  }

  handleSelect = (selectedKey) => {
    this.setState({
      activeComponent: selectedKey
    });
  }
}

export default App;
