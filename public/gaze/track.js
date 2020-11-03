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


// to show gaze on "experiments page" for recalibration purposes only
function PlotGaze(GazeData) {

  var x = GazeData.docX;
  var y = GazeData.docY;

  var id = GazeData.sid || 'gaze'
  var gaze = document.getElementById(id);
  if(!gaze) {
    var $gaze = $(`<div id="${id}" style ='position: absolute;display:none;width: 100px;height: 100px;border-radius: 50%;border: solid 2px  rgba(255, 255,255, .2);	box-shadow: 0 0 100px 3px rgba(125, 125,125, .5);	pointer-events: none;	z-index: 999999'></div>`)
    // $('body').append($gaze)
    gaze = $gaze.get(0)
    document.body.appendChild(gaze)
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

function DroppingBuffer(len) {
  this.len = len;
  this.idx = 0
  this.state = new Array(len)
}

DroppingBuffer.prototype.push = function(item) {
  this.state[this.idx] = item
  this.idx = (this.idx + 1) % this.len
  return item
}

DroppingBuffer.prototype.getState = function() {
  var start = this.state.slice(this.idx)
  var end = this.state.slice(0, this.idx)
  return start.concat(end)
}


let smoothsetting = true
let xbuf = new DroppingBuffer(5)
let ybuf = new DroppingBuffer(5)


//////set callbacks/////////
GazeCloudAPI.OnCalibrationComplete = function(){
  screenfull.exit()
  messageParent('calibrationComplete')
  document.body.style.overflow = ""
  console.log('gaze Calibration Complete')
  $('.step.s-3').show()
}
GazeCloudAPI.OnCamDenied = function() {
  console.log('camera access denied')
}
GazeCloudAPI.OnError = console.error
GazeCloudAPI.UseClickRecalibration = true;
GazeCloudAPI.OnResult = function(GazeData) {
  PlotGaze(GazeData)
  if(!inIframe) {
    socket.emit('gaze', GazeData);
  } else {
    if(smoothsetting) {
      xbuf.push(GazeData.docX)
      ybuf.push(GazeData.docY)
      GazeData.docX = xbuf.getState().reduce((a, b) => a + b) / 5
      GazeData.docY = ybuf.getState().reduce((a, b) => a + b) / 5
    }
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

  $('#gaze-smoothing').prop('checked', smoothsetting)
  $('#gaze-smoothing').change(e => {
    smoothsetting = e.target.checked
  })
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
