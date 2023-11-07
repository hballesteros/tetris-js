import './style.css'
import { BLOCK_SIZE, BOARD_WIDTH, BOARD_HEIGHT, EVENT_MOVEMENTS } from './consts.js'

// 1. inicializar el canvas
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const $score = document.querySelector('span')

let score = 0

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)

// 3. board
function createBoard (width, height) {
  return Array(height).fill().map(() => Array(width).fill(0))
}
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

// 4 pieza player
const piece = {
  position: { x: 5, y: 5 },
  shape: [
    [1, 1],
    [1, 1]
  ],
  colors: ['#FF0000', '#FF6600']
}

// 9. random pieces
const pieces = [
  [
    [1, 1],
    [1, 1]
  ],
  [
    [1, 1, 1],
    [0, 1, 0]
  ],
  [
    [1, 1, 1],
    [0, 0, 1]
  ],
  [
    [1, 1, 1],
    [1, 0, 0]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  [
    [1, 1, 1, 1]
  ]
]

const pieceColors = [
  ['#00FFFF', '#008080'], // Color de degradado para la primera pieza
  ['#0000FF', '#000080'], //
  ['#FFA500', '#FF8C00'], //
  ['#FFFF00', '#FFD700'], //
  ['#00FF00', '#008000'], //
  ['#800080', '#4B0082'], //
  ['#FF0000', '#8B0000'] //
]


// 2. game loop
// function update () {
//   draw()
//   window.requestAnimationFrame(update)
// }
let dropCounter = 0
let lastTime = 0
function update (time = 0) {
  const deltaTime = time - lastTime
  lastTime = time
  dropCounter += deltaTime
  if (dropCounter > 1000) {
    piece.position.y++
    dropCounter = 0

    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
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
      if (value === 1) {
        context.fillStyle = 'yellow'
        context.fillRect(x, y, 1, 1)
      }
    })
  })

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        const gradient = context.createLinearGradient(piece.position.x + x, piece.position.y + y, piece.position.x + x + 1, piece.position.y + y + 1)
        gradient.addColorStop(0, piece.colors[1])
        gradient.addColorStop(1, piece.colors[0])
        context.fillStyle = gradient
        context.fillRect(piece.position.x + x, piece.position.y + y, 1, 1)
      }
    })
  })

  $score.innerText = score
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
    }
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
      if (value === 1) {
        board[piece.position.y + y][piece.position.x + x] = 1
      }
    })
  })

  // get random piece
  piece.shape = pieces[Math.floor(Math.random() * pieces.length)]

  // get random colors
  piece.colors = pieceColors[Math.floor(Math.random() * pieceColors.length)]

  // reset position
  piece.position = {
    x: Math.floor(Math.random() * (BOARD_WIDTH - piece.shape[0].length)),
    y: 0
  }

  // gameover
  if (checkCollision()) {
    window.alert('Game Over!! Sorry!')
    board.forEach(row => row.fill(0))
  }
}

function removeRows () {
  board.forEach((row, y) => {
    if (row.every(value => value === 1)) {
      board.splice(y, 1)
      board.unshift(Array(BOARD_WIDTH).fill(0))
      score += 10
    }
  })
}

const $section = document.querySelector('section')

$section.addEventListener('click', () => {
  update()

  $section.remove()
  const audio = new window.Audio('/tetris.mp3')
  audio.volume = 0.5
  audio.play()
})
