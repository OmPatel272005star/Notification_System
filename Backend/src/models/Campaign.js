import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const campaignSchema = new Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    channel_type: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'in_app', 'mobile_push', 'rcs', 'mms', 'web_push'],
      required: true,
    },

    // ── Publish state ─────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },

    // ── Schedule ──────────────────────────────────────────────────────────────
    schedule_type: {
      type: String,
      enum: ['one_time', 'periodic'],
      default: 'one_time',
    },
    schedule_status: {
      type: String,
      enum: ['not_scheduled', 'scheduled', 'completed', 'live'],
      default: 'not_scheduled',
    },

    // publish_details: only scheduled_at (ISO) and published_at
    publish_details: {
      scheduled_at: { type: Date },   // ISO datetime set by admin — campaign fires at this exact time
      published_at:  { type: Date },  // timestamp of when admin clicked the final Publish button
    },

    // ── Periodic scheduling settings ──────────────────────────────────────────
    periodic_settings: {
      interval:        { type: String, enum: ['hourly', 'daily', 'weekly'], default: 'daily' },
      frequency:       { type: Number, default: 1, min: 1 },
      ends_type:       { type: String, enum: ['on', 'after'] },
      end_date:        { type: Date },           // only when ends_type === 'on'
      occurrences:     { type: Number },         // max runs, only when ends_type === 'after'
      occurrences_run: { type: Number, default: 0 }, // incremented by scheduler on each run
      next_run_at:     { type: Date },           // scheduler advances this after each run
    },

    // ── Content ───────────────────────────────────────────────────────────────
    template_id: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      default: null,
    },
    connection_id: {
      type: Schema.Types.ObjectId,
      ref: 'Connection',
      default: null,
    },

    // Email-specific content settings (no reply_to per design)
    email_settings: {
      sender_name: { type: String, trim: true, default: '' },
      subject:     { type: String, trim: true, default: '' },
    },

    // ── Audience ──────────────────────────────────────────────────────────────
    audience_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Audience',
      },
    ],

    // ── Access control ────────────────────────────────────────────────────────
    // Arrays of user _id strings.
    // The special string 'all' means every platform user.
    // Populated from GET /user/getBulkUser + a fixed "All Users" option in the UI.
    visible_to:  { type: [String], default: ['all'] },
    editable_by: { type: [String], default: ['admin'] },

    // ── Creator ───────────────────────────────────────────────────────────────
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Delivery stats (updated by scheduler worker in future scope) ──────────
    delivery_stats: {
      sent:      { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      opened:    { type: Number, default: 0 },
      clicked:   { type: Number, default: 0 },
      bounced:   { type: Number, default: 0 },
      failed:    { type: Number, default: 0 },
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// Index for fast list queries
campaignSchema.index({ created_by: 1, status: 1 });
campaignSchema.index({ schedule_status: 1 });
campaignSchema.index({ schedule_type: 1, schedule_status: 1, 'periodic_settings.next_run_at': 1 });

const Campaign = model('Campaign', campaignSchema);

export default Campaign;