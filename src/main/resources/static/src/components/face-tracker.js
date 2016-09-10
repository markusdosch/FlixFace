import React, { Component } from 'react';

// tracking js apparently cannot be imported via import 'tracking'
import '../../node_modules/tracking/build/tracking.js'
import '../../node_modules/tracking/build/data/face.js'


var faces = [];
const IMG_SIDELENGTH=224;
var faceListeners = [];

class FaceTracker extends Component {

  componentDidMount() {
    let video = this.refs.video;
    let canvas = this.refs.canvas;
    let context = canvas.getContext('2d');
    var tracker = new tracking.ObjectTracker('face');
    tracker.setInitialScale(4);
    tracker.setStepSize(2);
    tracker.setEdgesDensity(0.1);

    tracking.track(video, tracker, { camera: true });
    tracker.on('track', (event) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      faces = event.data;

      event.data.forEach((rect) => {
        context.strokeStyle = '#a64ceb';
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
        context.font = '11px Helvetica';
        context.fillStyle = "#fff";
        context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
        context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
      });
      
      faceListeners.forEach(l=>l()) 
    });
  }

  addFaceListeners(callback){
    faceListeners.push(callback);
  }
  removeFaceListener(callback){
    let index = faceListeners.indexOf(callback);
    if(index >= 0) faceListeners = faceListeners.splice(index, 1);
  }

  getNumberOfFaces() {
    return faces.length;
  }

  getFace() {
    if (faces.length == 0) return "no faces on image"

    var border = 17;
    var face = faces[0];

    var canvas = this.refs.cropcanv
    var ctx = canvas.getContext("2d");

    let cropWidth = (face.width + border * 2) *2;
    let cropHeight = (face.height + border * 2) *2;

    canvas.width = IMG_SIDELENGTH;
    canvas.height = IMG_SIDELENGTH;

    ctx.drawImage(this.refs.video, Math.max(face.x - border,0)*2, Math.max(face.y - border,0)*2, cropWidth, cropHeight, 0, 0, IMG_SIDELENGTH, IMG_SIDELENGTH);
    
    // return the .toDataURL of the temp canvas
    console.log(canvas.toDataURL().length)
    return canvas.toDataURL();
  }

  render() {
    return (
      <div className="Tracker">
            <canvas ref="cropcanv" style={{display:"none"}}/>
        <div className="demo-frame">
          <div className="demo-container">
            <video ref="video" width="320" height="240" preload autoPlay loop muted></video>
            <canvas ref="canvas" width="320" height="240"></canvas>
            
          </div>
        </div>

      </div>
    );
  }
}

export default FaceTracker;

