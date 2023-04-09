# frozen_string_literal: true

# GamesController
class GamesController < ApplicationController
  before_action :authenticate_user!, except: :index
  before_action :set_game, only: %i[show update destroy ai_move]
  require_dependency Rails.root.join('lib', 'reversi_ai')

  def index
    @games = Game.all
  end

  def show; end

  def new
    @game = Game.new
  end

  def create
    @game = Game.new(game_params)
    @game.user = current_user

    respond_to do |format|
      if @game.save
        format.html { redirect_to games_url, notice: 'Game was successfully created.' }
        format.turbo_stream
      else
        format.html { render :new, status: :unprocessable_entity }
      end
    end
  end

  def ai_move
    board = params[:board]
    color = params[:color]

    move = ReversiAi.new(board, color, @game.difficulty).move

    render json: { move: move }
  end

  def destroy
    @game.destroy

    respond_to do |format|
      format.html { redirect_to games_url, notice: 'Game was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_game
    @game = Game.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def game_params
    params.require(:game).permit(:multiplayer, :difficulty)
  end
end
