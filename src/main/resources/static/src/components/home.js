import React, { Component } from 'react';
import image from '../images/home.jpg';

class Home extends Component {
  componentDidMount() {
    document.body.style.background = `url(${image}) no-repeat center center fixed`;
    document.getElementsByTagName("html")[0].style.backgroundSize = "cover";
  }

  componentWillUnmount() {
    document.body.style.background = ``;
    document.getElementsByTagName("html")[0].style.backgroundSize = "";
  }

  render() {
    return (
      <div
      ></div>
    );
  }
}

export default Home;
