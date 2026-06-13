import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const campaignSchema = new Schema(
  {
    name:             { type: String, required: true, trim: true },
    description:      { type: String, trim: true, default: '' },
    channel_type:     { type: String, enum: ['email','sms','whatsapp','in_app','mobile_push','rcs','mms','web_push'], required: true },
    status:           { type: String, enum: ['draft','published'], default: 'draft' },
    schedule_type:    { type: String, enum: ['one_time','periodic'], default: 'one_time' },
    schedule_status:  { type: String, enum: ['not_scheduled','scheduled','completed','live'], default: 'not_scheduled' },
    publish_details: {
      scheduled_at: { type: Date },
      published_at: { type: Date },
    },
    periodic_settings: {
      interval:        { type: String, enum: ['hourly','daily','weekly'], default: 'daily' },
      frequency:       { type: Number, default: 1, min: 1 },
      ends_type:       { type: String, enum: ['on','after'] },
      end_date:        { type: Date },
      occurrences:     { type: Number },
      occurrences_run: { type: Number, default: 0 },
      next_run_at:     { type: Date },
    },
    template_id:    { type: Schema.Types.ObjectId, ref: 'Template', default: null },
    connection_id:  { type: Schema.Types.ObjectId, ref: 'Connection', default: null },
    email_settings: {
      sender_name: { type: String, trim: true, default: '' },
      subject:     { type: String, trim: true, default: '' },
    },
    audience_ids: [{ type: Schema.Types.ObjectId, ref: 'Audience' }],
    visible_to:   { type: [String], default: ['all'] },
    editable_by:  { type: [String], default: ['admin'] },
    created_by:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    delivery_stats: {
      sent:      { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      opened:    { type: Number, default: 0 },
      clicked:   { type: Number, default: 0 },
      bounced:   { type: Number, default: 0 },
      failed:    { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

campaignSchema.index({ created_by: 1, status: 1 });
campaignSchema.index({ schedule_status: 1 });
campaignSchema.index({ schedule_type: 1, schedule_status: 1, 'periodic_settings.next_run_at': 1 });

const Campaign = model('Campaign', campaignSchema);
export default Campaign;
