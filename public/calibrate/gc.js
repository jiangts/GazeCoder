var socket = io();

socket.on('connect', () => {
  console.log('connected')
  socket.emit('join room', '123');
});


//////set callbacks/////////
GazeCloudAPI.OnCalibrationComplete = function(){
  console.log('gaze Calibration Complete')
}
GazeCloudAPI.OnCamDenied = function() {
  alert('camera access denied')
}
GazeCloudAPI.OnError = console.error
GazeCloudAPI.UseClickRecalibration = true;
GazeCloudAPI.OnResult = function(GazeData) {
  socket.emit('gaze', GazeData);
}


$(function() {
  $('#startid').click(start)
  $('#stopid').click(stop)
})

function start() {
  screenfull.request()
  document.getElementById("startid").style.display = 'none';
  document.getElementById("stopid").style.display = 'block';

  GazeCloudAPI.StartEyeTracking();
  GazeCloudAPI.SetFps(15);
}

function stop() {
  document.getElementById("startid").style.display = 'block';
  document.getElementById("stopid").style.display = 'none';
  GazeCloudAPI.StopEyeTracking();
}
