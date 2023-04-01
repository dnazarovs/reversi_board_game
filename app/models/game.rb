# frozen_string_literal: true

# Creating Game model
class Game < ApplicationRecord
  belongs_to :user
end
