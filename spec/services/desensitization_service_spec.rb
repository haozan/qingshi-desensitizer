require 'rails_helper'

RSpec.describe DesensitizationService, type: :service do
  describe '#call' do
    it 'can be initialized and called' do
      service = DesensitizationService.new(
        text: 'Sample text',
        mappings: [{ original_text: 'Sample', desensitized_label: '【标签A】' }]
      )
      expect { service.call }.not_to raise_error
    end
  end
end
