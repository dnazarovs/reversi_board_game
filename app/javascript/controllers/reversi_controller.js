import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="reversi"
export default class extends Controller {

  static targets = ["board", "startGame", "resetGame"];
  connect() {
    this.gameId = this.data.get("gameId");
  }

  startGame(event) {
    const firstPlayer = event.target.dataset.player;
    this.startGameTarget.style.display = 'none';
    this.humanColor = firstPlayer === 'human' ? 'black' : 'white';
    this.computerColor = firstPlayer === 'human' ? 'white' : 'black';
    this.initialiseBoard();
    this.resetGameTarget.style.display = 'block';
    if (firstPlayer === 'computer') {
      this.computerMove();
    }
  }

  resetGame() {
    window.location.reload();
  }

  initialiseBoard() {
    const boardSize = 8;
    this.board = new Array(boardSize).fill(null).map(() => new Array(boardSize).fill(null));
    const boardElement = document.createElement('div');
    boardElement.classList.add('board');

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.dataset.row = row;
        cellElement.dataset.col = col;
        cellElement.addEventListener('click', this.makeMove.bind(this));
        boardElement.appendChild(cellElement);
      }
    }
    this.boardTarget.appendChild(boardElement);

    this.setPiece(3, 3, 'white');
    this.setPiece(3, 4, 'black');
    this.setPiece(4, 3, 'black');
    this.setPiece(4, 4, 'white');
    this.highlightValidMoves();
    this.initialBoardState = JSON.parse(JSON.stringify(this.board));
  }

  getCellElement(row, col) {
    return this.boardTarget.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  setPiece( row, col, color ) {
    const cell = this.getCellElement(row, col);
    const piece = document.createElement('div');
    piece.classList.add('piece', color);
    cell.appendChild(piece);
    this.board[row][col] = color;
  }

  deletePiece( row, col ) {
    const cell = this.getCellElement(row, col);
    cell.removeChild(cell.firstChild);
    this.board[row][col] = null;
  }

  makeMove(event) {
    if (this.isComputerMoving) {
      return; // Do not allow user to make a move if the computer is currently moving
    }
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (!this.board[row][col] && this.isValidMove(row, col, this.humanColor)) {
      this.setPiece(row, col, this.humanColor);
      this.flipPieces(row, col, this.humanColor);
      this.highlightValidMoves();
      this.computerMove();
    }
  }

  isValidMove(row, col, color) {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    for (const [dx, dy] of directions) {
      let x = row + dx;
      let y = col + dy;
      let foundOpponent = false;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (this.board[x][y] === null) {
          break;
        }

        if (this.board[x][y] !== color) {
          foundOpponent = true;
        } else if (foundOpponent) {
          return true;
        } else {
          break;
        }

        x += dx;
        y += dy;
      }
    }

    return false;
  }

  flipPieces(row, col, color) {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    for (const [dx, dy] of directions) {
      let x = row + dx;
      let y = col + dy;
      let toFlip = [];

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (this.board[x][y] === null) {
          break;
        }

        if (this.board[x][y] !== color) {
          toFlip.push([x, y]);
        } else {
          for (const [fx, fy] of toFlip) {
            this.deletePiece(fx, fy);
            this.setPiece(fx, fy, color);
          }
          break;
        }

        x += dx;
        y += dy;
      }
    }
  }

  highlightValidMoves() {
    const validMoveClass = 'valid-move';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = this.getCellElement(row, col);
        cell.classList.remove(validMoveClass);
        if (!this.board[row][col] && this.isValidMove(row, col, this.humanColor)) {
          cell.classList.add(validMoveClass);
        }
      }
    }
  }

  async computerMove() {
    this.isComputerMoving = true;

    try {
      const move = await this.getComputerMove(this.board, this.computerColor);
      const { row, col } = move;

      if (row != null && col != null) {
        this.setPiece(row, col, this.computerColor);
        this.flipPieces(row, col, this.computerColor);
        this.highlightValidMoves();
      }
    } catch (error) {
      console.error('Error during computer move:', error);
    } finally {
      this.isComputerMoving = false;
    }
  }

  async getComputerMove(board, color) {
    const gameId = this.element.dataset.gameId;
    const sanitizedBoard = board.map(row => row.map(cell => cell === null ? '.' : cell));

    const response = await fetch(`/games/${gameId}/ai_move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content,
      },
      body: JSON.stringify({
        board: sanitizedBoard,
        color: color,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error getting computer move: ${response.statusText}`);
    }

    const data = await response.json();
    return data.move;
  }
}