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

    const tracker = this.refs.tracker;
    if(tracker.getNumberOfFaces() === 1){
      var face = tracker.getFace()    
    } else {
      alert('there should only be one face');
      return;
    }
    let formData = new FormData(form);
    formData.append("image", dataURItoBlob(face));

    fetch(Environment.backendUrl + '/verify', {
      method: 'POST',
      body: formData
    })
      .then(response => response.text())
      .then(responseText => {
        if(responseText.contains('STOP'))
          this.onFaceInvalid(responseText)
        else this.onFaceValid(responseText)
      })
      .catch((error) => this.setState({
        message: "Error, please try again! Error was: " + error
      }))
    this.setState({
      step: LOADING
    })
  }

  onFaceValid(resp){
    this.setState({
      step: OK,
      name: resp
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


function dataURItoBlob(dataURI) {
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
  }
