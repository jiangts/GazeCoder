var DOMAIN = 'http://localhost:3000'
// var DOMAIN = '//gazecode.ml'

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

  var id = GazeData.sid || 'gaze'
  var gaze = document.getElementById(id);
  if(!gaze) {

    var $gaze = $(`<div id="${id}" style ='position: absolute;display:none;width: 100px;height: 100px;border-radius: 50%;border: solid 2px  rgba(255, 255,255, .2);	box-shadow: 0 0 100px 3px rgba(125, 125,125, .5);	pointer-events: none;	z-index: 999999'></div>`)
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


function pageSummary(config={}) {
  var { scrollNode, scrollSel, stripTags } = config
  if(scrollSel && !scrollNode) {
    scrollNode = document.querySelector(scrollSel)
  }

  var iframe = document.querySelector('iframe#esy-thumbnail')
  var clone
  if(!iframe) {
    iframe = document.createElement('iframe')
    iframe.id = 'esy-thumbnail'
  }

  // https://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript
  var body = document.body;
  var html = document.documentElement;
  var docheight

  if(scrollNode) {
    docheight = scrollNode.scrollHeight
    // $(`[data-cy="upload-droparea"]`).children[1]
  } else {
    docheight = Math.max( body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight );
  }

  var scale = 0.15
  var maxHeight = body.clientHeight / scale * 0.5

  iframe.setAttribute('style', `position: fixed;
    bottom: 1rem;
    right: 1rem;
    transform-origin: right bottom;
    transform: scale(${scale});
    width: 100vw;
    height: ${docheight}px;
    max-height: ${maxHeight}px;
    pointer-events: none;
    opacity: 0.85`)


  var clone = clone = document.cloneNode(true)
  if(stripTags) {
    stripTags.forEach(tag => {
      // clone.querySelectorAll('script').forEach(s => s.remove())
      clone.querySelectorAll(tag).forEach(s => s.remove())
    })
  }

  if(iframe.loaded) {

    var html = clone.body.innerHTML
    // if(html !== iframe.contentDocument.body.innerHTML) {
    // if () {
    //   iframe.contentDocument.body.innerHTML = html
    // }

  } else {

    iframe.style.display = 'none'
    iframe.onload = () => {
      try {
        var idocument = iframe.contentDocument;
        idocument.open();
        idocument.write(clone.documentElement.outerHTML);
        idocument.close();
        iframe.style.display = ''
      } catch (e) {}
      iframe.loaded = true
    }

    document.body.appendChild(iframe)
  }

  // setInterval(() => {
  //   if(scrollSel) {
  //     iframe.contentDocument.querySelector(scrollSel).scrollTo(scrollNode.scrollX, scrollNode.scrollY)
  //   } else {
  //     iframe.contentWindow.scrollTo(window.scrollX || document.scrollingElement.scrollX, window.scrollY || document.scrollingElement.scrollY)
  //   }
  // }, 100)


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
    socket.on('left room', sid => {
      $('#' + sid).remove()
    })

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

    // deep note specific
    var scrollSel = `[data-cy='upload-droparea'] > :last-child`
    var scrollNode = document.querySelector(scrollSel)
    var scrollWinSel = 'div.esy-scroller'
    setInterval(() => pageSummary({ scrollSel, stripTags: ['iframe', scrollWinSel] }), 1000)
    scrollNode.addEventListener('scroll', e => {
      t = e.target
      var w = window.innerWidth
      var h = window.innerHeight
      var x = t.scrollLeft
      var y = t.scrollTop
      socket.emit('scroll', { x, y, h, w })
    })

    socket.on('scroll', ({x, y, h, w}) => {

      var iframe2 = document.querySelector('iframe#esy-thumbnail')
      var doc = iframe2.contentDocument
      var scrollWin = doc.querySelector(scrollWinSel)
      if(!scrollWin) {
        scrollWin = document.createElement('div')
        scrollWin.classList.add('esy-scroller')
        scrollWin.setAttribute('style', 'position: absolute;z-index: 1000000000;border: 10px solid red;')
        doc.body.append(scrollWin)
      }
      scrollWin.style.top = y + 'px'
      scrollWin.style.left = x + 'px'
      scrollWin.style.width = w + 'px'
      scrollWin.style.height = h + 'px'
      // doc.querySelector(scrollSel).scrollTo(x, y)

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
