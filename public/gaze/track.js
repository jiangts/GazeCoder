function isInIframe () {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}
var inIframe = isInIframe()

function messageParent (msg) {
  parent.postMessage(msg, '*')
}

var socket

if(!inIframe) {
  socket = io();

  socket.on('connect', () => {
    console.log('connected')
    socket.emit('join room', '123');
  });
} else {
  Mousetrap.bind('esc', () => messageParent('exit'));
}


//////set callbacks/////////
GazeCloudAPI.OnCalibrationComplete = function(){
  screenfull.exit()
  messageParent('calibrationComplete')
  document.body.style.overflow = ""
  console.log('gaze Calibration Complete')
}
GazeCloudAPI.OnCamDenied = function() {
  console.log('camera access denied')
}
GazeCloudAPI.OnError = console.error
GazeCloudAPI.UseClickRecalibration = true;
GazeCloudAPI.OnResult = function(GazeData) {
  if(!inIframe) {
    socket.emit('gaze', GazeData);
  } else {
    messageParent({ type: 'emit', args: ['gaze', GazeData] })
  }
}


$(function() {
  $('#startid').click(start)
  $('#stopid').click(stop)
  $('#exit').click(() => messageParent('exit'))
  if(inIframe) {
    $('#exit').show()
  }

  $('form#room').submit(e => {
    e.preventDefault()
    const val = $(e.target).find('input').val()
    messageParent({ type: 'emit', args: ['join room', val] })
    $('.step.s-2').show()
  })
})

function start() {
  document.body.style.overflow = "hidden"
  screenfull.request()
  document.getElementById("startid").style.display = 'none';
  document.getElementById("stopid").style.display = 'block';

  GazeCloudAPI.StartEyeTracking();
  GazeCloudAPI.SetFps(15);
}

function stop() {
  document.body.style.overflow = ""
  document.getElementById("startid").style.display = 'block';
  document.getElementById("stopid").style.display = 'none';
  GazeCloudAPI.StopEyeTracking();
}
