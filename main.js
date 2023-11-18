import './style.css'
import { BLOCK_SIZE, BOARD_WIDTH, BOARD_HEIGHT, EVENT_MOVEMENTS, LEVELS } from './consts.js'

// 1. inicializar el canvas
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const $score = document.getElementById('score')
const $level = document.getElementById('level')
const $section = document.querySelector('section')
const audio = new window.Audio('/tetris.mp3')
const audioSuccess = new window.Audio('/success.mp3')
const audioRotate = new window.Audio('/rotate.mp3')
const audioTouch = new window.Audio('/touch.mp3')

let score = 0
let level = 0
let paused = false
let instantDrop = false

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)

// 3. board
function createBoard (width, height) {
  return Array(height).fill().map(() => Array(width).fill(0))
}
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

// 9. random pieces
const pieces = [
  [
    [1, 1],
    [1, 1]
  ],
  [
    [2, 2, 2],
    [0, 2, 0]
  ],
  [
    [0, 3],
    [0, 3],
    [3, 3]
  ],
  [
    [4, 0],
    [4, 0],
    [4, 4]
  ],
  [
    [5, 5, 0],
    [0, 5, 5]
  ],
  [
    [0, 6, 6],
    [6, 6, 0]
  ],
  [
    [7],
    [7],
    [7],
    [7]
  ]
]

const pieceColors = [
  ['#FFFF00', '#FFD700'],
  ['#800080', '#4B0082'],
  ['#0000FF', '#000080'],
  ['#FFA500', '#FF8C00'],
  ['#FF0000', '#8B0000'],
  ['#00FF00', '#008000'],
  ['#00FFFF', '#008080']
]

const piecesTypes = [
  'O',
  'T',
  'J',
  'L',
  'Z',
  'S',
  'I'
]

function getRandomPiece () {
  const randomIndex = Math.floor(Math.random() * pieces.length)
  const randomShape = pieces[randomIndex]
  const randomColors = pieceColors[randomIndex]
  const randomType = piecesTypes[randomIndex]

  const piece = {
    position: { x: 5, y: 5 }, // Puedes ajustar la posición según tus necesidades
    shape: randomShape,
    colors: randomColors,
    type: randomType
  }

  return piece
}

let piece = getRandomPiece()

// 2. game loop
let dropCounter = 0
let lastTime = 0
function update (time = 0) {
  // fijarse si el juego está pausado
  // agregar que se ponga oscura la pantalla y un mensaje de pausa
  if (paused) {
    window.requestAnimationFrame(update)
    canvas.classList.add('hidden-canvas') // Oculta el canvas
    audio.pause()
    return
  } else {
    canvas.classList.remove('hidden-canvas') // Muestra el canvas
  }

  const currentLevel = LEVELS[level]
  const dropInterval = currentLevel.speed
  const deltaTime = time - lastTime
  lastTime = time

  if (instantDrop) {
    while (!checkCollision()) {
      piece.position.y++
    }
    piece.position.y--
    instantDrop = false
  } else {
    dropCounter += deltaTime
    if (dropCounter > dropInterval) {
      piece.position.y++
      dropCounter = 0

      if (checkCollision()) {
        piece.position.y--
        solidifyPiece()
        removeRows()
      }
    }
  }

  draw()
  window.requestAnimationFrame(update)
}

function draw () {
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const gradient = context.createLinearGradient(x, y, x + 1, y + 1)
        gradient.addColorStop(0, pieceColors[value - 1][1])
        gradient.addColorStop(1, pieceColors[value - 1][0])
        context.fillStyle = gradient
        context.fillRect(x, y, 1, 1)
      }
    })
  })

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const gradient = context.createLinearGradient(piece.position.x + x, piece.position.y + y, piece.position.x + x + 1, piece.position.y + y + 1)
        gradient.addColorStop(0, piece.colors[1])
        gradient.addColorStop(1, piece.colors[0])
        context.fillStyle = gradient
        context.fillRect(piece.position.x + x, piece.position.y + y, 1, 1)
      }
    })
  })

  $score.innerText = score
  $level.innerText = level + 1
}

// 5. mover pieza
document.addEventListener('keydown', event => {
  if (event.key === EVENT_MOVEMENTS.LEFT) {
    piece.position.x--
    checkCollision() && piece.position.x++
  }

  if (event.key === EVENT_MOVEMENTS.RIGHT) {
    piece.position.x++
    checkCollision() && piece.position.x--
  }

  if (event.key === EVENT_MOVEMENTS.DOWN) {
    piece.position.y++
    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }

  if (event.key === EVENT_MOVEMENTS.ROTATE) {
    const rotated = []

    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = []
      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i])
      }

      rotated.push(row)
    }
    const previousShape = piece.shape
    piece.shape = rotated
    if (checkCollision()) {
      piece.shape = previousShape
    } else {
      audioRotate.play()
      audioRotate.volume = 0.2
    }
  }

  if (event.key === 'p') {
    paused = !paused
    if (!paused) {
      update()
      audio.play()
    }
  }

  if (event.key === ' ') {
    audioTouch.play()
    instantDrop = true
  }
})

function checkCollision () {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return value !== 0 && board[piece.position.y + y]?.[piece.position.x + x] !== 0
    })
  })
}

function solidifyPiece () {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[piece.position.y + y][piece.position.x + x] = value
      }
    })
  })

  // get random piece
  piece = getRandomPiece()

  // reset position
  piece.position = {
    x: Math.floor(Math.random() * (BOARD_WIDTH - piece.shape[0].length)),
    y: 0
  }

  // gameover
  if (checkCollision()) {
    window.alert('Game Over!! Sorry!')
    board.forEach(row => row.fill(0))
    score = 0
    level = 0
  }
}

const ROWS_PER_LEVEL = 2 // Cambia según sea necesario

function removeRows () {
  board.forEach((row, y) => {
    if (row.every(value => value !== 0)) {
      board.splice(y, 1)
      board.unshift(Array(BOARD_WIDTH).fill(0))
      score += 100
      audioSuccess.play()
    }
  })
  // Verificar si se ha alcanzado el número de filas para subir de nivel
  if (score >= (ROWS_PER_LEVEL * 100 * (level + 1))) {
    level++
    dropCounter = 0
  }
}

$section.addEventListener('click', () => {
  if (!paused) {
    update()
  }

  $section.remove()
  audio.volume = 0.5
  audio.play()
  audio.loop = true
})
