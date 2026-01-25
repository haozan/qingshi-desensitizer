class SensitiveMapping < ApplicationRecord
  # Validations
  validates :original_text, presence: true, length: { minimum: 1, maximum: 10000 }
  validates :desensitized_label, presence: true, 
            format: { with: /\A【.+】\z/, message: "必须使用中文方括号格式，如【机构A】" },
            uniqueness: { scope: :original_text, message: "该标签已被使用" }

  # Ensure unique mapping
  validates :original_text, uniqueness: { scope: :desensitized_label, message: "该原始文本已被脱敏" }

  # Scope for easier querying
  scope :recent, -> { order(created_at: :desc) }
  scope :by_label, ->(label) { where(desensitized_label: label) }
end
