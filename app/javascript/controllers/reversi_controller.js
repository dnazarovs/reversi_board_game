import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="reversi"
export default class extends Controller {

  // sets all targets to be available in the controller
  static targets = ["board", "startGame", "resetGame", "counter", "endGame"];
  connect() {
  }

  // method to start the game when the user clicks on the start button and sets the first player
  startGame(event) {
    const firstPlayer = event.target.dataset.player; // gets the data-player attribute from the button
    this.startGameTarget.style.display = 'none';  // hides the start button
    this.humanColor = firstPlayer === 'human' ? 'black' : 'white'; // sets the color of the human player
    this.computerColor = firstPlayer === 'human' ? 'white' : 'black'; // sets the color of the computer player
    this.initialiseBoard();
    this.counterTarget.style.display = ''; // shows the counter
    this.resetGameTarget.style.display = 'block'; // shows the reset button
    if (firstPlayer === 'computer') {
      this.computerMove(); // if the computer is the first player, it makes the first move
    }
  }

  resetGame() {
    window.location.reload();
  }

    // method to initialise the board
  initialiseBoard() {
    const boardSize = 8;
    this.board = new Array(boardSize).fill(null).map(() => new Array(boardSize).fill(null)); // creates a 2D array of 8x8
    const boardElement = document.createElement('div');
    boardElement.classList.add('board');

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.dataset.row = row;
        cellElement.dataset.col = col;
        cellElement.addEventListener('click', this.makeMove.bind(this)); // adds an event listener to each cell
        boardElement.appendChild(cellElement);
      }
    }
    this.boardTarget.appendChild(boardElement);

    // sets the initial pieces
    this.setPiece(3, 3, 'white');
    this.setPiece(3, 4, 'black');
    this.setPiece(4, 3, 'black');
    this.setPiece(4, 4, 'white');

    this.updatePieceCount(); // updates the counter
    this.highlightValidMoves(); // highlights the valid moves for user
    this.initialBoardState = JSON.parse(JSON.stringify(this.board));
  }

  // gets cell element from row and column
  getCellElement(row, col) {
    return this.boardTarget.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  // sets the piece on the board
  setPiece( row, col, color ) {
    const cell = this.getCellElement(row, col);
    const piece = document.createElement('div');
    piece.classList.add('piece', color); // adds the class piece with color of player
    cell.appendChild(piece);
    this.board[row][col] = color;
  }

  // deletes the piece from the board
  deletePiece( row, col ) {
    const cell = this.getCellElement(row, col);
    cell.removeChild(cell.firstChild);
    this.board[row][col] = null;
  }

  // main method to make a move is executed when the user clicks on a cell
  makeMove(event) {
    if (this.isComputerMoving) {
      return; // Do not allow user to make a move if the computer is currently moving
    }

    const targetElement = event.target.classList.contains('piece') ? event.target.parentElement : event.target; // if user tries to click on the piece, it will get the parent element
    const row = parseInt(targetElement.dataset.row);
    const col = parseInt(targetElement.dataset.col);

    if (!this.board[row][col] && this.isValidMove(row, col, this.humanColor)) { // checks if the cell is empty and if the move is valid
      this.setPiece(row, col, this.humanColor);
      this.flipPieces(row, col, this.humanColor);
      this.highlightValidMoves();
      this.isComputerMoving = true; // sets the flag to true so computer will make a move next
      setTimeout(() => this.computerMove(), 500); // waits for 500ms before making the computer move and calls the it
    }else if (!this.hasValidMoves(this.humanColor)) { // if the user does not have any valid moves, it will make another move for the computer
      this.isComputerMoving = true;
      setTimeout(() => this.computerMove(), 500);
    }
  }

  // method to check if the move is valid
  isValidMove(row, col, color) {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    for (const [dx, dy] of directions) { // loops through all the directions
      let x = row + dx;
      let y = col + dy;
      let foundOpponent = false; // flag to check if the opponent piece is found

      while (x >= 0 && x < 8 && y >= 0 && y < 8) { // checks if the move is within the board
        if (this.board[x][y] === null) {
          break; // if the cell is empty, it will break the loop
        }

        if (this.board[x][y] !== color) {
          foundOpponent = true; // if the cell is not empty and the color is not the same as the current player, it will set the flag to true
        } else if (foundOpponent) {
          return true; // if the flag is true, it will return true
        } else {
          break; // if the flag is false, it will break the loop
        }

        x += dx;
        y += dy;
      }
    }

    return false;
  }

  // flip the pieces
  flipPieces(row, col, color) {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    for (const [dx, dy] of directions) { // loops through all the directions
      let x = row + dx;
      let y = col + dy;
      let toFlip = []; // array to store the pieces to flip

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (this.board[x][y] === null) {
          break;
        }

        if (this.board[x][y] !== color) {
          toFlip.push([x, y]); // adds the piece to the array
        } else {
          for (const [fx, fy] of toFlip) { // loops through the array and flips the pieces
            this.deletePiece(fx, fy); // deletes the previous piece
            this.setPiece(fx, fy, color); // sets the new piece
          }
          break;
        }

        x += dx;
        y += dy;
      }
    }
    this.updatePieceCount(); // updates the counter
  }

  // highlights the valid moves for the user
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

  // makes the computer move
  async computerMove() {
    const move = await this.getComputerMove(this.board, this.computerColor); // gets row and col from backend
    if (!move.pass) { // if returned value is not pass, it will make the move
      const { row, col } = move;
      this.setPiece(row, col, this.computerColor);
      this.flipPieces(row, col, this.computerColor);
    }
    if (this.hasValidMoves(this.humanColor)) { // checks if the user has any valid moves
      this.isComputerMoving = false; // and only then tells that the computer has finished moving
      this.highlightValidMoves(); // highlights the valid moves for the user
    } else {
      setTimeout(() => this.computerMove(), 500); // if the user does not have any valid moves, it will make another move for the computer
    }
  }

  // gets the computer move from the backend
  async getComputerMove(board, color) {
    const gameId = this.element.dataset.gameId; // gets the game id from the data attribute
    const sanitizedBoard = board.map(row => row.map(cell => cell === null ? '.' : cell)); // sanitizes the board replaces null with .

    // Ajax request to get the computer move
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

    // if the returned value is null, it will return pass else it will return the row and col
    if (data.move === null) {
      return { pass: true };
    } else {
      return data.move;
    }
  }

  // checks if the player has any valid moves
  hasValidMoves(color) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (!this.board[row][col] && this.isValidMove(row, col, color)) {
          return true;
        }
      }
    }
    return false;
  }

  // updates the counter and ends the game if there are no more valid moves or the board is full
  updatePieceCount() {
    const blackScoreElement = this.element.querySelector('#black-score');
    const whiteScoreElement = this.element.querySelector('#white-score');

    let blackScore = 0;
    let whiteScore = 0;

    whiteScore = this.board.flat().filter(cell => cell === 'white').length;
    blackScore = this.board.flat().filter(cell => cell === 'black').length;

    blackScoreElement.textContent = blackScore;
    whiteScoreElement.textContent = whiteScore;

    if (blackScore + whiteScore === 64 || (!this.hasValidMoves(this.humanColor) && !this.hasValidMoves(this.computerColor))) {
      const winner = blackScore > whiteScore ? 'Black' : (blackScore < whiteScore ? 'White' : null);
        const winnerScore = blackScore > whiteScore ? blackScore : whiteScore;
        const loserScore = blackScore > whiteScore ? whiteScore : blackScore;
      this.showEndGame(winner, winnerScore, loserScore); // shows the end game message
    }
  }

  // shows the end game message
  showEndGame(winner, winnerScore, loserScore) {
    const endGameMessage = this.endGameTarget.querySelector(".end-game-message");
    endGameMessage.textContent = winner ? `Player ${winner} wins! with score: ${winnerScore}:${loserScore}` : "It's a draw!";
    this.endGameTarget.style.display = "block"; // shows the end game message
  }
}
