class DesensitizationService < ApplicationService
  attr_reader :text, :mappings

  def initialize(text:, mappings:)
    @text = text
    @mappings = mappings
  end

  # Instance method for service pattern
  def call
    self.class.desensitize(@text, @mappings)
  end

  # Desensitize text by replacing original text with labels
  # @param text [String] The original text to desensitize
  # @param mappings [Array<Hash>] Array of {original_text: String, desensitized_label: String}
  # @return [String] The desensitized text
  def self.desensitize(text, mappings)
    result = text.dup
    
    # Sort by length desc to handle overlapping matches correctly
    sorted_mappings = mappings.sort_by { |m| -m[:original_text].length }
    
    sorted_mappings.each do |mapping|
      original = mapping[:original_text]
      label = mapping[:desensitized_label]
      
      # Replace all occurrences of exact match
      result.gsub!(original, label) if original.present? && label.present?
    end
    
    result
  end

  # Restore desensitized text back to original
  # @param text [String] The desensitized text
  # @param mappings [Array<Hash>] Array of {original_text: String, desensitized_label: String}
  # @return [String] The restored text
  def self.restore(text, mappings)
    result = text.dup
    
    # Sort by label length desc to handle overlapping matches correctly
    sorted_mappings = mappings.sort_by { |m| -m[:desensitized_label].length }
    
    sorted_mappings.each do |mapping|
      original = mapping[:original_text]
      label = mapping[:desensitized_label]
      
      # Replace all occurrences of label back to original
      result.gsub!(label, original) if original.present? && label.present?
    end
    
    result
  end

  # Count occurrences of text in content
  # @param content [String] The text to search in
  # @param search_text [String] The text to search for
  # @return [Integer] Number of occurrences
  def self.count_occurrences(content, search_text)
    return 0 if content.blank? || search_text.blank?
    content.scan(search_text).length
  end

  # Validate desensitization label format
  # @param label [String] The label to validate
  # @return [Boolean] True if valid format
  def self.valid_label_format?(label)
    return false if label.blank?
    label.match?(/\A【.+】\z/)
  end
end
