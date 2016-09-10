import React, { Component } from 'react';
import { Button, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import FaceTracker from './face-tracker';
import FieldGroup from './fieldgroup';

const CHECKING = 1;
const LOADING = 2;
const OK = 3;
const GO_AWAY = 4;

class Check extends Component {

  constructor(){
    super();
    this.state = {
      step: CHECKING,
      name: ""
    } 
  }

  componentDidMount(){
    this.checkForFace();
  }

  checkForFace(){
    this.faceDetectedCallback = () => this.onFaceDetected()
    this.refs.tracker.addFaceListener(this.faceDetectedCallback)
  }

  onFaceDetected(){
    this.refs.tracker.removeFaceListener(this.faceDetectedCallback)

    // send to server

    this.setState({
      step: LOADING
    })
  }

  onFaceValid(resp){
    this.setState({
      step: OK,
      name: resp.name
    })
    setTimeout(()=>this.checkForFace(), 1000)
  }
  onFaceInvalid(resp){
    this.setState({
      step: GO_AWAY
    })
    setTimeout(()=>this.checkForFace(), 1000)
  }

  render() {
    var message;
    switch(this.state.step){
      case CHECKING: message = <div className="check_footer">
        <h1>Please come closer</h1>
        </div>; break;
      case LOADING: message = <div className="check_footer gray">
        <h1>Loading</h1>
      </div>; break;
      case OK: message = <div className="check_footer green">
        <h1>Enjoy your ride, {this.state.name}</h1>
      </div>;break;
      case GO_AWAY: message = <div className="check_footer red">
        <h1>Just Go Away</h1>
      </div>;break;
    }

    return (
      <div className="face-checker">

        <FaceTracker ref="tracker"/>

        {message}
      </div>
    );
  }
}

export default Check;
