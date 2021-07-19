// var DOMAIN = 'http://localhost:3000'
var DOMAIN = '//gazecode.ml'

var INJECTED = '__GAZECODER__'
var FRAMEID = 'gazecoder-frame'
var THUMBFRAMEID = 'gazecoder-thumbnail-frame'

/*
var scrollParent = $0
var div = document.createElement('div')
div.style.width=div.style.height='2px'
div.style.border='2px solid red'
div.style.position='absolute'
scrollParent.appendChild(div)
var rect = scrollParent.getBoundingClientRect()
scrollParent.addEventListener('click', e => {
    console.log(e)
    div.style.left = e.x - rect.x + scrollParent.scrollLeft + 'px'
    div.style.top = e.y - rect.y + scrollParent.scrollTop + 'px'
})
 */

// deep note specific
var markCells = scroller => {
  if(scroller.markedCells) return
  var cells = scroller.querySelectorAll('div[data-cy="cell"]')
  if(cells.length > 5) {
    scroller.querySelectorAll('div[data-cy="cell"]').forEach((el, i) => {
      el.setAttribute('data-esy-id', i)
    })
    scroller.markedCells = true
  }
}
var getRect = _.memoize(el => el.getBoundingClientRect())
function deepnoteProcessGaze(GazeData, config={}) {
  if(GazeData.calibration) return GazeData
  const { scroller } = config

  var x = GazeData.docX;
  var y = GazeData.docY;
  const el = document.elementFromPoint(x, y)
  if(scroller.contains(el)) {
    GazeData.deepnote = 1
    GazeData.rect = getRect(scroller)
    GazeData.offset = { x: scroller.scrollLeft, y: scroller.scrollTop }
    markCells(scroller)
    const cell = el.closest('div[data-cy="cell"]')
    if(cell) {
      GazeData.roi = {
        id: cell.getAttribute('data-esy-id')
      }
      const now = Date.now()
      if(_.get(cell, 'lastRect', 0) < now - 3000) {
        GazeData.roi.rect = cell.getBoundingClientRect()
        cell.lastRect = now
      }
      // console.log(GazeData.roi)
    }
  }
  return GazeData
}

function deepnoteProcessMouse(event, config={}) {
  const { x, y } = event
  const { scroller } = config
  const MouseData = { x, y }

  if(scroller.contains(event.target)) {
    MouseData.deepnote = 1
    MouseData.rect = getRect(scroller)
    MouseData.offset = { x: scroller.scrollLeft, y: scroller.scrollTop }
    markCells(scroller)
    const cell = event.target.closest('div[data-cy="cell"]')
    if(cell) {
      MouseData.roi = {
        id: cell.getAttribute('data-esy-id')
      }
      const now = Date.now()
      if(_.get(cell, 'lastRect', 0) < now - 3000) {
        MouseData.roi.rect = cell.getBoundingClientRect()
        cell.lastRect = now
      }
      // console.log(MouseData.roi)
    }
  }
  return MouseData
}

var gazeOn = true
function PlotGaze(GazeData, document, offset, scroller) {

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

    // var $gaze = $(`<div id="${id}" style ='position: absolute;display:none;width: 100px;height: 100px;border-radius: 50%;border: solid 2px  rgba(255, 255,255, .2);	box-shadow: 0 0 100px 3px rgba(125, 125,125, .5);	pointer-events: none;	z-index: 999999'></div>`)
    var $gaze = $(`<div class='gaze-bbl' id="${id}" style ='position: absolute;display:block;width: 100px;height: 100px;border-radius: 50%;border: solid 2px rgba(255, 255,255, .2);	box-shadow: 0 0 100px 3px rgba(125, 125,125, .5);	pointer-events: none;	z-index: 999999'></div>`)
    // $('body').append($gaze)
    gaze = $gaze.get(0)
    document.body.appendChild(gaze)
  }
  x -= gaze .clientWidth/2;
  y -= gaze .clientHeight/2;



  gaze.style.left = x + "px";
  gaze.style.top = y + "px";
  if(offset) {
    gaze.style.left = x + document.esyoffsetX + 'px'
    gaze.style.top = y + document.esyoffsetY + 'px'
  } else {
    // deep note specific
    var deepgaze = document.getElementById('deep' + id);
    if(!deepgaze && scroller) {
      var $gaze = $(`<div class='gaze-bbl' id="${'deep' + id}" style ='position: absolute;display:none;width: 100px;height: 100px;border-radius: 50%;border: solid 2px  rgba(255, 255,255, .2);	box-shadow: 0 0 100px 3px rgba(125, 125,125, .5);	pointer-events: none;	z-index: 999999'></div>`)
      deepgaze = $gaze.get(0)
      scroller.appendChild(deepgaze)
    }
    if(GazeData.deepnote) {
      const { rect, offset } = GazeData
      deepgaze.style.left = x - rect.x + offset.x + 'px'
      deepgaze.style.top = y - rect.y + offset.y + 'px'
      $(gaze).hide()
      $(deepgaze).show()
    } else {
      $(gaze).show()
      $(deepgaze).hide()
    }
  }


  var $notif = $('#esy-notif')
  if(!$notif.length) {
    $notif = $(`<div id="esy-notif" style="display: none; position: fixed; top: 5px; right: 5px; border: 1px solid red; background-color: white;">partner is looking away</div>`).appendTo('body')
  }
  if(GazeData.state != 0)
  {
    if( gaze.style.display  == 'block') {
      gaze.style.display = 'none';
      $notif.show()
    }
  }
  else
  {
    if( gaze.style.display  == 'none') {
      if(!GazeData.deepnote) {
        gaze.style.display = 'block';
      }
      $notif.hide()
    }
  }

  if(!gazeOn) $('.gaze-bbl').hide()
}

var mouseOn = true
function PlotMouse(MouseData, document, offset, scroller) {
  var { x, y } = MouseData
  x -= 4 // image offset

  var id = 'mouse-' + MouseData.sid || 'mouse'
  var mouse = document.getElementById(id);
  const url = DOMAIN + '/images/iconmonstr-cursor-32-green.svg'
  if(!mouse) {
    var $mouse = $(`<img class="esy-mouse" id="${id}" src="${url}" style ="position: absolute; z-index: 1000000000; pointer-events: none; height: 20px; width: 20px;"></img>`)
    mouse = $mouse.get(0)
    document.body.appendChild(mouse)
  }


  mouse.style.left = x + "px";
  mouse.style.top = y + "px";
  if(offset) {
    mouse.style.left = x + document.esyoffsetX + 'px'
    mouse.style.top = y + document.esyoffsetY + 'px'
  } else {
    // deep note specific
    var deepmouse = document.getElementById('deep' + id);
    if(!deepmouse && scroller) {
      var $mouse = $(`<img class="esy-mouse" id="${'deep' + id}" src="${url}" style ="position: absolute; z-index: 1000000000; pointer-events: none; height: 20px; width: 20px;"></img>`)
      deepmouse = $mouse.get(0)
      scroller.appendChild(deepmouse)
    }
    if(MouseData.deepnote) {
      const { rect, offset } = MouseData
      deepmouse.style.left = x - rect.x + offset.x + 'px'
      deepmouse.style.top = y - rect.y + offset.y + 'px'
      $(mouse).hide()
      $(deepmouse).show()
    } else {
      $(mouse).show()
      $(deepmouse).hide()
    }
  }

  if(!mouseOn) $('.esy-mouse').hide()
}


var minimapOn = true
function pageSummary(config={}) {
  var { scrollNode, scrollSel, stripTags } = config
  if(scrollSel && !scrollNode) {
    scrollNode = document.querySelector(scrollSel)
  }

  var iframe = document.querySelector('iframe#' + THUMBFRAMEID)
  var clone
  if(!iframe) {
    iframe = document.createElement('iframe')
    iframe.id = THUMBFRAMEID
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

  var scale = 0.10
  // var maxHeight = body.clientHeight / scale * 0.5
  var maxHeight = body.clientHeight / scale * 0.9

  iframe.setAttribute('style', `position: fixed;
    bottom: 1rem;
    right: 1rem;
    transform-origin: right bottom;
    transform: scale(${scale});
    width: 100vw;
    /*height: ${docheight}px;*/
    height: ${maxHeight}px;
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

  var getStyleNodes = (doc=document) => {
    const css = doc.styleSheets
    const links = []
    const rules = [].concat(...[...css].map(s => {
      try {
        return [...s.cssRules||[]]
      } catch (error) {
        links.push(s)
        return []
      }
    }))
    const style = document.createElement('style')
    style.innerHTML = rules.map(r => r.cssText).join('\n')
    return {
      style,
      links: links.map(r => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.setAttribute('data-esy', '1')
        link.href = r.href
        return link
      })
    }
  }

  // https://stackoverflow.com/questions/2952667/find-all-css-rules-that-apply-to-an-element
  var getMatchedCSSRules = (el, css = el.ownerDocument.styleSheets) =>
    [].concat(...[...css].map(s => [...s.cssRules||[]])) /* 1 */
    .filter(r => el.matches(r.selectorText));            /* 2 */


  const insertAtIndex = (parentElement, newElement, index) => {
    parentElement.insertBefore(newElement, parentElement.children[index]);
  }

  const { style, links } = getStyleNodes()
  clone.head.appendChild(style)
  links.forEach(link => {
    clone.head.appendChild(link)
  })


  if(iframe.loaded) {

    // var html = clone.body.innerHTML
    // if(html !== iframe.contentDocument.body.innerHTML) {
    //   iframe.contentDocument.body.innerHTML = html
    //   console.log('same', html === iframe.contentDocument.body.innerHTML)
    // }
    const refreshView = (sel, keepSel) => {
      const html = clone.querySelector(sel).innerHTML
      const frameEl = iframe.contentDocument.querySelector(sel)
      const keepers = frameEl.querySelectorAll(keepSel)
      if(html !== frameEl.innerHTML) {
        frameEl.innerHTML = html
        keepers.forEach(k => {
          frameEl.appendChild(k)
        })
      }
    }
    refreshView(scrollSel, '[data-esy-ui]')

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

    // IFRAME
    // document.body.appendChild(iframe)
    document.documentElement.appendChild(iframe)
    // document.querySelector('#content-root').appendChild(iframe)
  }

  // setInterval(() => {
  //   if(scrollSel) {
  //     iframe.contentDocument.querySelector(scrollSel).scrollTo(scrollNode.scrollX, scrollNode.scrollY)
  //   } else {
  //     iframe.contentWindow.scrollTo(window.scrollX || document.scrollingElement.scrollX, window.scrollY || document.scrollingElement.scrollY)
  //   }
  // }, 100)


}

function renderViewport ({scrollSel, id, color}) {
  return ({x, y, h, w}) => {

    var iframe2 = document.querySelector('iframe#' + THUMBFRAMEID)
    var doc = iframe2.contentDocument
    var scrollWin = doc.getElementById(id)

    var scrollNode = doc.querySelector(scrollSel)
    var th = scrollNode.scrollHeight
    var scrollPos = y / (th-h) * (th-iframe2.offsetHeight)
    scrollNode.scrollTop = scrollPos

    if(!scrollWin) {
      scrollWin = document.createElement('div')
      scrollWin.id = id
      scrollWin.setAttribute('style', `position: absolute;z-index: 1000000000;border: 10px solid ${color};`)
      scrollWin.setAttribute('data-esy-ui', true)
      // doc.body.append(scrollWin)
      scrollNode.append(scrollWin)
    }
    // set offsets for gaze bubble in thumbnail
    // but only when remote scrolls, not when local scrolls
    if(id !== 'esy-sw-me') {
      doc.esyoffsetX = x
      doc.esyoffsetY = y
    }
    scrollWin.style.top = y + 'px'
    scrollWin.style.left = x + 'px'
    scrollWin.style.width = w + 'px'
    scrollWin.style.height = h + 'px'
    // doc.querySelector(scrollSel).scrollTo(x, y)

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

    // deep note specific
    let iframe2
    socket.on('gaze', data => {
      PlotGaze(data, document, false, scrollNode)
      if(!iframe2) {
        iframe2 = document.querySelector('iframe#' + THUMBFRAMEID)
      }
      PlotGaze(data, iframe2.contentDocument, true)
    })

    socket.on('mouse', data => {
      PlotMouse(data, document, false, scrollNode)
      if(!iframe2) {
        iframe2 = document.querySelector('iframe#' + THUMBFRAMEID)
      }
      PlotMouse(data, iframe2.contentDocument, true)
    })
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
    // IFRAME
    document.body.appendChild(iframe)
    // document.documentElement.appendChild(iframe)
    iframe.src = DOMAIN + '/gaze/track.html'

    const processMouse = event => {
      socket.emit('mouse', deepnoteProcessMouse(event, {
        scroller: scrollNode
      }))
    }
    addEventListener('message', event => {
      var data = event.data
      if(data === 'calibrationComplete') {
        $(iframe).css('width', '0px')
      }
      if(data === 'exit') {
        $(iframe).css('width', '0px')
      }
      if(data === 'cursor on') {
        addEventListener('mousemove', processMouse)
        mouseOn = true
        $('.esy-mouse').show()
      }
      if(data === 'cursor off') {
        removeEventListener('mousemove', processMouse)
        mouseOn = false
        $('.esy-mouse').hide()
      }
      if(data === 'minimap on') {
        minimapOn = true
        $('iframe#' + THUMBFRAMEID).show()
      }
      if(data === 'minimap off') {
        minimapOn = false
        $('iframe#' + THUMBFRAMEID).hide()
      }
      if(data === 'gaze on') {
        gazeOn = true
        $('.gaze-bbl').show()
      }
      if(data === 'gaze off') {
        gazeOn = false
        $('.gaze-bbl').hide()
      }
      else if(data.type === 'emit') {
        if(data.args[0] === 'gaze') {
          // deep note specific
          socket.emit('gaze', deepnoteProcessGaze(data.args[1], {
            scroller: scrollNode
          }))
        } else {
          socket.emit(...data.args)
        }
      }
    })

    // deep note specific
    var scrollSel = '#notebook-view' // `[data-cy='upload-droparea'] > :last-child`
    var scrollNode = document.querySelector(scrollSel)
    var scrollWinSel = 'div.esy-scroller'
    setInterval(() => minimapOn && pageSummary({
      scrollSel,
      stripTags: ['iframe', scrollWinSel, /*'script[src*="main.bundle"]'*/, 'script']
    }), 1000)
    scrollNode.addEventListener('scroll', e => {
      t = e.target
      var w = window.innerWidth
      var h = window.innerHeight
      var x = t.scrollLeft
      var y = t.scrollTop
      var data = { x, y, h, w }
      renderViewport({ scrollSel, id: 'esy-sw-me', color: 'darkgrey' })(data)
      socket.emit('scroll', data)
    })

    socket.on('scroll', data => {
      renderViewport({ scrollSel, id: data.id, color: '#fc9021' })(data)
      if(data.w < window.innerWidth) {
        chrome.runtime.sendMessage({
          type: "resize",
          data
        }, function(response) {});
      }
    })
  })

  function addStyle(styleString) {
    const style = document.createElement('style');
    style.id = 'nix-cursor'
    style.textContent = styleString;
    document.head.append(style);
  }
  addStyle(`.view-overlays[role="presentation"] .cdr, .contentWidgets {
    display: none !important;
  }`);
} else {
  var iframe = document.getElementById(FRAMEID)
  if($(iframe).css('width') === '0px') {
    $(iframe).css('width', '100%')
  } else {
    $(iframe).css('width', '0px')
  }
}
