// var DOMAIN = 'http://localhost:3000'
var DOMAIN = 'http://35.188.80.59/'

var INJECTED = '__GAZECODER__'
var FRAMEID = 'gazecoder-frame'

function PlotGaze(GazeData) {

  /*
     GazeData.state // 0: valid gaze data; -1 : face tracking lost, 1 : gaze uncalibrated
     GazeData.docX // gaze x in document coordinates
     GazeData.docY // gaze y in document cordinates
     GazeData.time // timestamp
     */

  // document.getElementById("GazeData").innerHTML = "GazeX: " + GazeData.GazeX + " GazeY: " + GazeData.GazeY;
  // document.getElementById("HeadPhoseData").innerHTML = " HeadX: " + GazeData.HeadX + " HeadY: " + GazeData.HeadY + " HeadZ: " + GazeData.HeadZ;
  // document.getElementById("HeadRotData").innerHTML = " Yaw: " + GazeData.HeadYaw + " Pitch: " + GazeData.HeadPitch + " Roll: " + GazeData.HeadRoll;

  var x = GazeData.docX;
  var y = GazeData.docY;

  var gaze = document.getElementById("gaze");
  if(!gaze) {

    var $gaze = $(`<div id ="gaze" style ='position: absolute;display:none;width: 100px;height: 100px;border-radius: 50%;border: solid 2px  rgba(255, 255,255, .2);	box-shadow: 0 0 100px 3px rgba(125, 125,125, .5);	pointer-events: none;	z-index: 999999'></div>`)
    $('body').append($gaze)
    gaze = $gaze.get(0)
  }
  x -= gaze .clientWidth/2;
  y -= gaze .clientHeight/2;



  gaze.style.left = x + "px";
  gaze.style.top = y + "px";


  if(GazeData.state != 0)
  {
    if( gaze.style.display  == 'block')
      gaze.style.display = 'none';
  }
  else
  {
    if( gaze.style.display  == 'none')
      gaze.style.display = 'block';
  }

}


if(!window[INJECTED]) {
  window[INJECTED] = true
  $(() => {
    var socket = io(DOMAIN);

    socket.on('connect', () => {
      console.log('connected')
      // socket.emit('join room', '123');
    });

    socket.on('gaze', PlotGaze)

    var iframe = document.createElement('iframe')
    iframe.id = FRAMEID
    iframe.setAttribute('style', `
      position: fixed;
      z-index: 10000000000;
      width: 100%;
      height: 100%;
      top: 0px;
      left: 0px;
      border: none;`)
    iframe.setAttribute('allow', 'camera;fullscreen')
    document.body.appendChild(iframe)
    iframe.src = DOMAIN + '/gaze/track.html'

    addEventListener('message', event => {
      var data = event.data
      if(data === 'calibrationComplete') {
        $(iframe).css('width', '0px')
      }
      if(data === 'exit') {
        $(iframe).css('width', '0px')
      }
      else if(data.type === 'emit') {
        socket.emit(...data.args)
      }
    })
  })
} else {
  var iframe = document.getElementById(FRAMEID)
  if($(iframe).css('width') === '0px') {
    $(iframe).css('width', '100%')
  } else {
    $(iframe).css('width', '0px')
  }
}
