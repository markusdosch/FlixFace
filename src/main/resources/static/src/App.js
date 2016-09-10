import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import './App.css';
import logo from './Flixbus_2015_logo.svg';

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
          <div className="nav" style={{display: "flex", flexDirection: "row", justifyContent: "space-around", paddingBottom: "10px"}}>
            <a href="" onClick={(event) => this.handleSelect(event, 1)}>Home</a>
            <a href="" onClick={(event) => this.handleSelect(event, 2)}>Entrance Check</a>
            <a href="" onClick={(event) => this.handleSelect(event, 3)}>Add User</a>            
          </div>
          <img src={logo} className="App-logo" alt="logo" />
        </div>

        <div className="App-content">
          {activeComponent}
        </div>
      </div>
    );
  }

  handleSelect = (event, selectedKey) => {
    event.preventDefault();
    this.setState({
      activeComponent: selectedKey
    });
  }
}

export default App;
