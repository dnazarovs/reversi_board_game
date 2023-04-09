# frozen_string_literal: true

#Adding difficulty to game
class AddDifficultyToGame < ActiveRecord::Migration[7.0]
  def change
    add_column :games, :difficulty, :integer
  end
end
