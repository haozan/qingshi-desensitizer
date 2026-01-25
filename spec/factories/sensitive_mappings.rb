FactoryBot.define do
  factory :sensitive_mapping do

    original_text { "MyText" }
    desensitized_label { "MyString" }

  end
end
