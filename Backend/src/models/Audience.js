import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * edit_history entry — one record pushed every time the audience record is updated.
 * Gives a full audit trail: who changed it, when, what action, which fields.
 */
const editHistorySchema = new Schema(
  {
    edited_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    edited_at: {
      type: Date,
      default: Date.now,
    },
    // What action was performed
    action: {
      type: String,
      enum: ['created', 'updated', 'imported'],
      default: 'updated',
    },
    // Which fields were changed (e.g. ["first_name", "email", "address.city"])
    changed_fields: {
      type: [String],
      default: [],
    },
    // Optional note
    change_note: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const audienceSchema = new Schema(
  {
    // ── Personal Information ─────────────────────────────────────────────────
    first_name: {
      type: String,
      required: true,
      trim: true,
    },

    last_name: {
      type: String,
      required: true,
      trim: true,
    },

    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },

    // ── Contact — Email ────────────────────────────────────────────────────
    emails: [
      {
        email: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        is_primary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // ── Contact — Phone ────────────────────────────────────────────────────
    phone_numbers: [
      {
        phone_code: {
          type: String,
          required: true,
          trim: true,
        },
        number: {
          type: String,
          required: true,
          trim: true,
        },
        is_primary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // ── Address ────────────────────────────────────────────────────────────
    address: {
      city:    { type: String, trim: true },
      state:   { type: String, trim: true },
      country: { type: String, trim: true },
    },

    // ── Social Media Handles ───────────────────────────────────────────────
    // Stores platform + handle pairs
    social_media_handles: [
      {
        platform: {
          type: String,
          enum: [
            'email', 'sms', 'whatsapp', 'instagram',
            'twitter', 'facebook', 'linkedin', 'telegram',
          ],
        },
        handle: { type: String, trim: true, default: '' },
      },
    ],

    // ── Status ─────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'inactive', 'unsubscribed'],
      default: 'active',
    },

    // ── Ownership ──────────────────────────────────────────────────────────
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    last_edited_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // ── Full Edit Timeline ─────────────────────────────────────────────────
    // Every save pushes a new entry for complete audit trail.
    edit_history: {
      type: [editHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
audienceSchema.index({ 'emails.email': 1 });
audienceSchema.index({ created_by: 1 });
audienceSchema.index({ status: 1 });

const Audience = mongoose.model('Audience', audienceSchema);

export default Audience;