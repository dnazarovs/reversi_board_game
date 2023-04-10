# frozen_string_literal: true

# Creating ReversiAi class
class ReversiAi
  DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1], [1, 0], [1, 1]
  ].freeze

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

  def alpha_beta(board, color, depth, alpha, beta)
    return [evaluate(board, color), nil] if depth.zero? || game_over?(board)

    best_move = nil
    moves = valid_moves(board, color)

    moves.each do |move|
      new_board = apply_move(board, move, color)
      opponent = color == 'white' ? 'black' : 'white'
      score = -alpha_beta(new_board, opponent, depth - 1, -beta, -alpha).first

      if score > alpha
        alpha = score
        best_move = move
      end

      break if alpha >= beta
    end

    [alpha, best_move]
  end

  def evaluate(board, color)
    opponent = color == 'white' ? 'black' : 'white'
    my_pieces = board.flatten.count { |piece| piece == color }
    opponent_pieces = board.flatten.count { |piece| piece == opponent }
    my_pieces - opponent_pieces
  end

  def game_over?(board)
    valid_moves(board, 'white').empty? && valid_moves(board, 'black').empty?
  end

  def valid_moves(board, color)
    opponent = color == 'white' ? 'black' : 'white'
    moves = []

    board.each_with_index do |row, row_idx|
      row.each_with_index do |cell, col_idx|
        next unless cell == '.'

        DIRECTIONS.each do |direction|
          if valid_move?(board, row_idx, col_idx, color, opponent, direction)
            moves << [row_idx, col_idx]
            break
          end
        end
      end
    end
    moves
  end

  def valid_move?(board, row, col, color, opponent, direction)
    row_step, col_step = direction
    row += row_step
    col += col_step

    return false if !in_bounds?(row, col) || board[row][col] != opponent

    loop do
      row += row_step
      col += col_step
      return false unless in_bounds?(row, col)

      return true if board[row][col] == color
      return false if board[row][col] == '.'
    end
  end

  def in_bounds?(row, col)
    row.between?(0, 7) && col.between?(0, 7)
  end

  def apply_move(board, move, color)
    new_board = Marshal.load(Marshal.dump(board))
    row, col = move
    new_board[row][col] = color

    DIRECTIONS.each do |direction|
      apply_move_direction(new_board, row, col, color, direction)
    end

    new_board
  end

  def apply_move_direction(board, row, col, color, direction)
    row_step, col_step = direction
    row += row_step
    col += col_step

    opponent = color == 'white' ? 'black' : 'white'
    cells_to_flip = []

    while in_bounds?(row, col) && board[row][col] == opponent
      cells_to_flip << [row, col]
      row += row_step
      col += col_step
    end

    if in_bounds?(row, col) && board[row][col] == color
      cells_to_flip.each do |flip_row, flip_col|
        board[flip_row][flip_col] = color
      end
    end
  end
end
