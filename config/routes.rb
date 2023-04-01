# frozen_string_literal: true

# Routes
Rails.application.routes.draw do
  root to: 'games#index'
  resources :games
  devise_for :users
end
