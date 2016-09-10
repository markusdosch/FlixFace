import React, { Component } from 'react';
import { Button, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import FaceTracker from './face-tracker.js';

import Environment from '../environment';

function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}

class Add extends Component {
  constructor() {
    super();
    this.state = {
      message: ""
    }
  }

  render() {
    return (
      <form onSubmit={this.addUser}>
        <FieldGroup
          id="formControlsName"
          type="text"
          label="Name"
          name="name"
          placeholder="Enter your name"
          required
          />

        <Button
          onClick={this.takePhoto}
          >
          Take Photo
        </Button>

        <Button
          type="submit"
          >
          Register
        </Button>

        <div>
          {this.state.message}
        </div>          

        <FaceTracker ref="tracker"/>
      </form>
    );
  }

  addUser = (event) => {
    event.preventDefault();

    let form = document.querySelector('form');

    // Register the user on the backend, but only if he has (1) entered his name and (2) taken a photo with correct face visible
    if (!form.name || !this.state.faceImage) return; // TODO: Show the user that he isn't finished entering his information

    let formData = new FormData(form);
    formData.append("image", this.dataURItoBlob(this.state.faceImage));

    fetch(Environment.backendUrl + '/add', {
      method: 'POST',
      body: formData
    })
      .then(response => response.text())
      .then(responseText => this.setState({
        message: responseText
      }))
      .catch((error) => this.setState({
        message: "Error, please try again! Error was: " + error
      }))
  }

  dataURItoBlob(dataURI) {
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
  }

  takePhoto = (event) => {
    const tracker = this.refs.tracker;
    if(tracker.getNumberOfFaces() === 1){
      this.setState({
        faceImage: tracker.getFace()
      })
    }
  }
}

export default Add;
