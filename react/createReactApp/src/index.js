import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import './index.css'

const Square = (props) => {
  return (
    <botton className="square" onClick={props.onClick}>{ props.value }</botton>
  )
}

const Board = (props) => {
  const renderSquare = (i) => {
    return (
      <Square
        value={props.squares[i]}
        onClick={() => {
          props.onClick(i)
        }}
      ></Square>
    )
  }
  return (
    <div>
      <div className="status">{ props.status }</div>
      <div className="board-row">
        { renderSquare(0) }
        { renderSquare(1) }
        { renderSquare(2) }
      </div>
      <div className="board-row">
        { renderSquare(3) }
        { renderSquare(4) }
        { renderSquare(5) }
      </div>
      <div className="board-row">
        { renderSquare(6) }
        { renderSquare(7) }
        { renderSquare(8) }
      </div>
    </div>
  )
}

// class Board extends React.Component {
//   renderSquare(i) {
//     return <Square value={this.props.squares[i]} onClick={() => {
//       this.props.onClick(i)
//     }} />
//   }
//   render() {
//     return (
//       <div>
//         <div className="status">{ this.props.status }</div>
//         <div className="board-row">
//           { this.renderSquare(0) }
//           { this.renderSquare(1) }
//           { this.renderSquare(2) }
//         </div>
//         <div className="board-row">
//           { this.renderSquare(3) }
//           { this.renderSquare(4) }
//           { this.renderSquare(5) }
//         </div>
//         <div className="board-row">
//           { this.renderSquare(6) }
//           { this.renderSquare(7) }
//           { this.renderSquare(8) }
//         </div>
//       </div>
//     )
//   }
// }

const Game = (props) => {
  const [history, setHistory] = useState([{squares: Array(9).fill(null)}])
  const [stepNumber, setStepNumber] = useState(0)
  const [xIsNext, setXIsNext] = useState(true)

  const handleClick = (i) => {
    const historyCopy = history.slice(0, stepNumber + 1)
    const current = historyCopy[historyCopy.length - 1]
    const squares = current.squares.slice()
    if (calculateWinner(squares) || squares[i]) {
      return
    }
    squares[i] = xIsNext ? 'X' : 'O'
    setHistory(historyCopy.concat([{
      squares
    }]))
    setStepNumber(historyCopy.length)
    setXIsNext(!xIsNext)
  }

  const jumpTo = (move) => {
    setStepNumber(move)
    const x = move % 2 === 0
    setXIsNext(x)
  }

  const current = history[stepNumber]
  const winner = calculateWinner(current.squares)
  const moves = history.map((step, move) => {
    const desc = move ? `Go to move ${move}` : `Go to game start`
    return (
      <li key={move}>
        <button
          onClick={() => jumpTo(move)}
        >{ desc }</button>
      </li>
    )
  })
  let status
  if (winner) {
    status = `Winner: ${winner}`
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={current.squares} onClick={(i) => handleClick(i)}></Board>
      </div>
      <div className="game-info">
        <div>{ status }</div>
        <ol>{ moves }</ol>
      </div>
    </div>
  )
}

// class Game extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       history: [{
//         squares: Array(9).fill(null)
//       }],
//       stepNumber: 0,
//       xIsNext: true
//     }
//   }
//   handleClick(i) {
//     const history = this.state.history.slice(0, this.state.stepNumber + 1)
//     const current = history[history.length - 1]
//     const squares = current.squares.slice()
//     if (calculateWinner(squares) || squares[i]) {
//       return
//     }
//     squares[i] = this.state.xIsNext ? 'X' : 'O'
//     this.setState({
//       history: history.concat([{
//         squares
//       }]),
//       stepNumber: history.length,
//       xIsNext: !this.state.xIsNext
//     })
//   }
//   jumpTo(stepNumber) {
//     this.setState({
//       stepNumber,
//       xIsNext: (stepNumber % 2) === 0
//     })
//   }
//   render() {
//     const history = this.state.history
//     const current = history[this.state.stepNumber]
//     const winner = calculateWinner(current.squares)

//     const moves = history.map((step, move) => {
//       const desc = move ? `Go to move ${move}` : `Go to game start`
//       return (
//         <li key={move}>
//           <button onClick={() => this.jumpTo(move)}>{ desc }</button>
//         </li>
//       )
//     })

//     let status
//     if (winner) {
//       status = `Winner: ${winner}`
//     } else {
//       status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`
//     }

//     return (
//       <div className="game">
//         <div className="game-board">
//           <Board squares={current.squares} onClick={(i) => this.handleClick(i)}></Board>
//         </div>
//         <div className="game-info">
//           <div>{ status }</div>
//           <ol>{ moves }</ol>
//         </div>
//       </div>
//     )
//   }
// }

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}

ReactDOM.render(
  <Game></Game>,
  document.getElementById('root')
)
