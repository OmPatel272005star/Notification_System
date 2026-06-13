import mongoose from 'mongoose';

const { Schema } = mongoose;

const editHistorySchema = new Schema(
  {
    edited_by:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    edited_at:      { type: Date, default: Date.now },
    action:         { type: String, enum: ['created','updated','imported'], default: 'updated' },
    changed_fields: { type: [String], default: [] },
    change_note:    { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const audienceSchema = new Schema(
  {
    first_name:   { type: String, required: true, trim: true },
    last_name:    { type: String, required: true, trim: true },
    dob:          { type: Date },
    gender:       { type: String, enum: ['male','female','other','prefer_not_to_say'] },
    emails: [{
      email:      { type: String, required: true, trim: true, lowercase: true },
      is_primary: { type: Boolean, default: false },
    }],
    phone_numbers: [{
      phone_code: { type: String, required: true, trim: true },
      number:     { type: String, required: true, trim: true },
      is_primary: { type: Boolean, default: false },
    }],
    address: {
      city:    { type: String, trim: true },
      state:   { type: String, trim: true },
      country: { type: String, trim: true },
    },
    social_media_handles: [{
      platform: { type: String, enum: ['email','sms','whatsapp','instagram','twitter','facebook','linkedin','telegram'] },
      handle:   { type: String, trim: true, default: '' },
    }],
    status:         { type: String, enum: ['active','inactive','unsubscribed'], default: 'active' },
    created_by:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    last_edited_by: { type: Schema.Types.ObjectId, ref: 'User' },
    edit_history:   { type: [editHistorySchema], default: [] },
  },
  { timestamps: true }
);

audienceSchema.index({ 'emails.email': 1 });
audienceSchema.index({ created_by: 1 });
audienceSchema.index({ status: 1 });

const Audience = mongoose.model('Audience', audienceSchema);
export default Audience;
