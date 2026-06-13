import mongoose from 'mongoose';

const { Schema } = mongoose;

const editHistorySchema = new Schema(
  {
    edited_by:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    edited_at:   { type: Date, default: Date.now },
    change_note: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const templateSchema = new Schema(
  {
    name:         { type: String, required: true, trim: true, maxlength: 512 },
    description:  { type: String, trim: true, default: '' },
    channel_type: { type: String, enum: ['email','sms','whatsapp','in_app','mobile_push','rcs','mms','web_push'], required: true },
    status:       { type: String, enum: ['draft','active','archived'], default: 'draft' },
    content: {
      html_body:     { type: String, default: '' },
      text_preview:  { type: String, default: '', maxlength: 300 },
      grapesjs_data: { type: Schema.Types.Mixed, default: null },
      subject:       { type: String, trim: true, default: '' },
    },
    visible_to:   { type: [String], default: ['all'] },
    editable_by:  { type: [String], default: ['admin'] },
    created_by:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    edit_history: { type: [editHistorySchema], default: [] },
  },
  { timestamps: true }
);

templateSchema.index({ channel_type: 1 });
templateSchema.index({ status: 1 });
templateSchema.index({ created_by: 1 });

const Template = mongoose.model('Template', templateSchema);
export default Template;
