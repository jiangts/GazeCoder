$(function() {
  var $surface = $('div.calibrate')
  $surface.append('<button class="exit">Exit</button>')
  $surface.hide()
  $surface.find('button.exit').click(() => {
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
  const placeBlock = (css, cls) => {
    return $(`<div class="gaze-target ${cls}"></div>`)
      .css({
        ...css,
        height: 50,
        width: 50,
        'background-color': 'red'
      }).appendTo($surface)
  }
  // center block
  placeBlock({ margin: 'auto', 'margin-top': '40vh', }, 'center-block')

  // random blocks
  placeBlock({ position: 'fixed', 'left': '20vw', 'top': '80vh', })
  placeBlock({ position: 'fixed', 'left': '30vw', 'top': '70vh', })
  placeBlock({ position: 'fixed', 'left': '40vw', 'top': '60vh', })
  placeBlock({ position: 'fixed', 'left': '40vw', 'top': '80vh', })

  placeBlock({ position: 'fixed', 'right': '20vw', 'top': '80vh', })
  placeBlock({ position: 'fixed', 'right': '30vw', 'top': '70vh', })
  placeBlock({ position: 'fixed', 'right': '40vw', 'top': '60vh', })
  placeBlock({ position: 'fixed', 'right': '40vw', 'top': '80vh', })

  placeBlock({ position: 'fixed', 'left': '20vw', 'top': '40vh', })
  placeBlock({ position: 'fixed', 'left': '30vw', 'top': '40vh', })
  placeBlock({ position: 'fixed', 'left': '40vw', 'top': '40vh', })

  placeBlock({ position: 'fixed', 'right': '20vw', 'top': '40vh', })
  placeBlock({ position: 'fixed', 'right': '30vw', 'top': '40vh', })
  placeBlock({ position: 'fixed', 'right': '40vw', 'top': '40vh', })

  placeBlock({ position: 'fixed', 'left': '40vw', 'top': '20vh', })
  placeBlock({ position: 'fixed', 'right': '40vw', 'top': '20vh', })

  placeBlock({ position: 'fixed', 'left': '15vw', 'top': '15vh', })
  placeBlock({ position: 'fixed', 'right': '15vw', 'top': '15vh', })

  // $('<div class="gaze-target"></div>')
  //   .css({
  //     margin: 'auto',
  //     height: 50,
  //     width: 50,
  //     'background-color': 'red'
  //   }).appendTo($surface)

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
