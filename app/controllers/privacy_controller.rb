class PrivacyController < ApplicationController
  layout 'application'

  def show
    @full_render = true
  end
end
