import React, { Component } from 'react';
import FaceTracker from './face-tracker.js';

class Add extends Component {

  render() {
    return (
      <p>
        Add a new user
        
        <FaceTracker ref="tracker"/>
      </p>
    );
  }
}

export default Add;
