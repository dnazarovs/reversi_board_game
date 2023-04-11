# frozen_string_literal: true

# reversi_ai.rb
class ReversiAi
  # Creating DIRECTIONS constant as possible directions for a move
  DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1], [1, 0], [1, 1]
  ].freeze

  # Creating initialize method, which takes in board, color, and difficulty
  def initialize(board, color, difficulty)
    @board = board
    @color = color
    @difficulty = case difficulty
                  when :easy then 3
                  when :medium then 4
                  when :hard then Float::INFINITY
                  else
                    3
                  end

  end

  # Move method which returns the best move for the AI to front end.
  def move
    best_move = alpha_beta(@board, @color, @difficulty, -Float::INFINITY, Float::INFINITY).last
    if best_move.nil?
      moves = valid_moves(@board, @color)
      return nil if moves.empty? # Return nil if there are no valid moves

      best_move = moves.first
    end
    { row: best_move[0], col: best_move[1] }
  end

  private

  # Alpha beta algorithm to determine the best move for the AI
  def alpha_beta(board, color, depth, alpha, beta)
    return [evaluate(board, color), nil] if depth.zero? || game_over?(board) # Return the score if the game is over or the depth is 0

    best_move = nil
    moves = valid_moves(board, color) # Get all valid moves for the current player at current board state

    moves.each do |move|
      new_board = apply_move(board, move, color)
      opponent = color == 'white' ? 'black' : 'white'
      score = -alpha_beta(new_board, opponent, depth - 1, -beta, -alpha).first

      if score > alpha # If the score is greater than alpha, update alpha and best move
        alpha = score
        best_move = move
      end

      break if alpha >= beta # If alpha is greater than or equal to beta, break the loop
    end

    [alpha, best_move] # Return the score and best move
  end

  # Evaluate the board state and return the score
  def evaluate(board, color)
    opponent = color == 'white' ? 'black' : 'white'
    my_pieces = board.flatten.count { |piece| piece == color }
    opponent_pieces = board.flatten.count { |piece| piece == opponent }
    my_pieces - opponent_pieces
  end

  # Check if the game is over
  def game_over?(board)
    valid_moves(board, 'white').empty? && valid_moves(board, 'black').empty?
  end

  # Get all valid moves for the current player at current board state
  def valid_moves(board, color)
    opponent = color == 'white' ? 'black' : 'white'
    moves = []

    board.each_with_index do |row, row_idx|
      row.each_with_index do |cell, col_idx| # Iterate through each cell in the board
        next unless cell == '.'              # Skip the cell if it is not empty

        DIRECTIONS.each do |direction| # Iterate through each direction
          if valid_move?(board, row_idx, col_idx, color, opponent, direction)
            moves << [row_idx, col_idx]    # Add the move to the moves array if it is a valid move
            break
          end
        end
      end
    end
    moves
  end

  # Check if the move is valid
  def valid_move?(board, row, col, color, opponent, direction)
    row_step, col_step = direction
    row += row_step
    col += col_step

    return false if !in_bounds?(row, col) || board[row][col] != opponent # Return false if the move is not in bounds or the cell is not the opponent's piece

    loop do # Loop through the board until the move is not valid
      row += row_step
      col += col_step # Increment the row and column by the direction
      return false unless in_bounds?(row, col) # Return false if the move is not in bounds

      return true if board[row][col] == color # Return true if the cell is the current player's piece
      return false if board[row][col] == '.' # Return false if the cell is empty
    end
  end

  # Check if the move is in bounds
  def in_bounds?(row, col)
    row.between?(0, 7) && col.between?(0, 7)
  end

  # Apply the move to the board
  def apply_move(board, move, color)
    new_board = Marshal.load(Marshal.dump(board)) # Make a copy with new object array
    row, col = move
    new_board[row][col] = color # Set the cell to the current player's color

    DIRECTIONS.each do |direction| # Iterate through each direction
      apply_move_direction(new_board, row, col, color, direction) # Apply the move in the direction
    end
  end

  # Apply the move in the direction
  def apply_move_direction(board, row, col, color, direction)
    row_step, col_step = direction
    row += row_step
    col += col_step

    opponent = color == 'white' ? 'black' : 'white'
    cells_to_flip = [] # Array to store the cells to flip

    while in_bounds?(row, col) && board[row][col] == opponent # Loop through the board until the move is not valid
      cells_to_flip << [row, col] # Add the cell to the cells to flip array
      row += row_step
      col += col_step
    end

    if in_bounds?(row, col) && board[row][col] == color # If the cell is the current player's piece, flip the cells
      cells_to_flip.each do |flip_row, flip_col| # Iterate through each cell to flip
        board[flip_row][flip_col] = color # Flip the cell
      end
    end
  end
end
