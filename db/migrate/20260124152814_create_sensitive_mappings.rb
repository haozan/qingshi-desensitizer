class CreateSensitiveMappings < ActiveRecord::Migration[7.2]
  def change
    create_table :sensitive_mappings do |t|
      t.text :original_text
      t.string :desensitized_label, default: ""


      t.timestamps
    end
  end
end
