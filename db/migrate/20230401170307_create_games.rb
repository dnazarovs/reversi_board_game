# frozen_string_literal: true

# Creating Game Table
class CreateGames < ActiveRecord::Migration[7.0]
  def change
    create_table :games do |t|
      t.references :user, null: false, foreign_key: true
      t.boolean :multiplayer, null: false, default: false
      t.timestamps
    end
  end
end
