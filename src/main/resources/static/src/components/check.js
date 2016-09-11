import React, { Component } from 'react';
import { Button, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import FaceTracker from './face-tracker';
import FieldGroup from './fieldgroup';
import Environment from '../environment';
import { dataURItoBlob } from '../common-methods';

const CHECKING = 1;
const LOADING = 2;
const OK = 3;
const GO_AWAY = 4;

class Check extends Component {

  constructor() {
    super();
    this.state = {
      step: CHECKING,
      name: ""
    };
  }

  componentDidMount() {
    this.checkForFace();
  }

  componentWillUnmount() {
    this.refs.tracker.removeFaceListener(this.faceDetectedCallback);
    this.faceDetectedCallback = null;
  }

  checkForFace() {
    this.faceDetectedCallback = () => this.onFaceDetected()
    this.refs.tracker.addFaceListener(this.faceDetectedCallback)
  }

  onFaceDetected() {
    const tracker = this.refs.tracker;

    if (tracker.getNumberOfFaces() > 1 || tracker.getNumberOfFaces <= 0) {
      this.setState({
        message: "There should only be one face!"
      })
      return;
    }

    let face = tracker.getFace();

    this.refs.tracker.removeFaceListener(this.faceDetectedCallback)
    const formData = new FormData();

    formData.append("image", dataURItoBlob(face));

    fetch(Environment.backendUrl + '/verify', {
      method: 'POST',
      body: formData
    })
      .then(response => response.text())
      .then(responseText => {
        if (responseText.startsWith('STOP')) {
          this.onFaceInvalid(responseText)
        } else {
          this.onFaceValid(responseText)
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          message: "Error, please try again! Error was: " + error
        })
      })
    this.setState({
      step: LOADING
    })
  }

  onFaceValid(resp) {
    this.setState({
      step: OK,
      name: resp
    })
    setTimeout(() => this.checkForFace(), 3000)
  }

  onFaceInvalid(resp) {
    this.setState({
      step: GO_AWAY
    })
    setTimeout(() => this.checkForFace(), 3000)
  }

  render() {
    let message;
    switch (this.state.step) {
      case CHECKING: message = <div className="check_footer">
        <h1>Please come closer</h1>
      </div>; break;
      case LOADING: message = <div className="check_footer gray">
        <h1>Confirming your identity..</h1>
      </div>; break;
      case OK: message = <div className="check_footer green">
        <h1>Enjoy your ride, {this.state.name}</h1>
      </div>; break;
      case GO_AWAY: message = <div className="check_footer red">
        <h1>Just Go Away</h1>
      </div>; break;
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
