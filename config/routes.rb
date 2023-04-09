# frozen_string_literal: true

# Routes
Rails.application.routes.draw do
  root to: 'games#index'
  resources :games do
    member do
      post :ai_move
    end
  end
  devise_for :users
end
