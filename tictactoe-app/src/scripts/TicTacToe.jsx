// The tictactoe exercise, ported from ../../no-build/tictactoe/tictactoe.jsx.
//
// Same components, same game logic -- the only difference is how the file is
// loaded. There, Babel compiles the JSX in the browser and React comes from a
// <script> tag in no-build/libs/, so the code refers to the global
// `React.useState`.
// Here, Vite compiles it ahead of time and React is a real npm package, so it
// is imported. Compare the two files side by side to see what the build step
// actually buys you.

import { useState } from "react";
import "../styles/TicTacToe.css";

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

// Board draws the 3x3 grid. It owns no state of its own -- the three props are
// everything it needs: whose turn it is, the current 9 squares, and a callback
// to report a move back up to Game (which is where the state actually lives).
function Board({ xIsNext, squares, onPlay }) {
  // runs when the player clicks square number `i` (0-8)
  function handleClick(i) {
    // checks if a square is already filled, or if someone has already won
    if (squares[i] || calculateWinner(squares)) {
      return; // ignore the click -- the move is not allowed
    }
    // copy the array, then edit the copy. mutating `squares` directly would not
    // trigger a re-render, because React compares the old and new array by
    // reference to decide whether anything changed.
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    // hand the finished board to Game; Board itself never stores it
    onPlay(nextSquares);
  }

  // re-checked on every render, so this stays correct even after jumping back
  // through the move history
  const winner = calculateWinner(squares);
  // text shown above the board: the winner, or who moves next
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      {/* the "Winner: X" / "Next player: O" line */}
      <div className="status">{status}</div>
      {/* three rows of three squares. each Square gets its current value and an
          onClick that knows which index it is, so handleClick can fill it in */}
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

// Game is the only component with state. Everything below is the "single source
// of truth" for the whole match: whose turn it is, every board position played
// so far, and which of those positions is currently on screen.
export default function Game() {
  // true when it is X's turn (X always starts)
  const [xIsNext, setXIsNext] = useState(true);
  // one entry per move played, starting with the empty board. the history is
  // what makes "jump to move #n" possible later.
  const [history, setHistory] = useState([Array(9).fill(null)]);
  // index into history that is currently displayed
  const [currentMove, setCurrentMove] = useState(0);
  // the board to render: whichever history entry currentMove points at
  const currentSquares = history[currentMove];

  // called by Board with the updated board when a square is clicked
  function handlePlay(nextSquares) {
    // drop any moves that were ahead of currentMove, then append the new one.
    // without the slice, playing after a "jump back" would leave stale moves
    // sitting after the new board.
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1); // show the move just played
    setXIsNext(!xIsNext); // hand the turn to the other player
  }
  // clicking a history button: just move the pointer, no new board is created
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    // rebuild whose turn it is: X plays the even-numbered moves, O the odd ones
    setXIsNext(nextMove % 2 === 0);
  }
  // one <li> per history entry, built from the move list
  const moves = history.map((squares, move) => {
    // label the button by position in the list
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      // key lets React tell the buttons apart when the list changes
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        {/* Board reads the current position and reports moves back up */}
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        {/* history is tracked in state; the move buttons are the next step */}
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
