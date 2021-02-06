$(function() {
  var $surface = $('div.calibrate')
  $surface.append('<button>Exit</button>')
  $surface.hide()
  $surface.find('button').click(() => {
    $('.calibrate').hide()
  })
  $surface.append
  var pairs = [
    ['top', 'left'],
    ['bottom', 'left'],
    ['top', 'right'],
    ['bottom', 'right']
  ]
  pairs.forEach(function(pair) {
    $('<div class="gaze-target"></div>')
      .css({
        position: 'fixed',
        [pair[0]]: 20,
        [pair[1]]: 20,
        height: 50,
        width: 50,
        'background-color': 'red'
      }).appendTo($surface)
  })
  const placeBlock = (...css) => {
    $('<div class="gaze-target"></div>')
      .css({
        ...css,
        height: 50,
        width: 50,
        'background-color': 'red'
      }).appendTo($surface)
  }
  // center block
  placeBlock({ margin: 'auto', 'margin-top': '50vh', })

  // random blocks
  placeBlock({ 'margin-left': '20vw', 'margin-top': '80vh', })
  placeBlock({ 'margin-left': '30vw', 'margin-top': '70vh', })
  placeBlock({ 'margin-left': '40vw', 'margin-top': '60vh', })

  $('<div class="gaze-target"></div>')
    .css({
      margin: 'auto',
      height: 50,
      width: 50,
      'background-color': 'red'
    }).appendTo($surface)

  $surface.css({
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    'z-index': 100,
    'background-color': 'lightgrey',
  })

  $('#fine-calibrate').click(() => {
    $surface.show()
  })
})
