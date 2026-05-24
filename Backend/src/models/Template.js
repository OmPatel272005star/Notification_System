import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * edit_history entry — one record pushed every time the template is updated.
 * Gives a full audit trail: who changed it and when.
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
    // Optional short note — e.g. "changed subject line", "redesigned layout"
    change_note: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }   // no extra _id per history entry
);

const templateSchema = new Schema(
  {
    // ── Identity ────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 512,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Channel ─────────────────────────────────────────────────────────────
    // Maps to frontend CHANNELS: Email, WhatsApp, SMS, In-App Messaging,
    // Mobile Push, RCS, MMS, Web Push
    channel_type: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'in_app', 'mobile_push', 'rcs', 'mms', 'web_push'],
      required: true,
    },

    // ── Status ──────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },

    // ── Content ─────────────────────────────────────────────────────────────
    content: {
      // Compiled HTML from GrapesJS (getHtml() + getCss() as <style> block)
      // This string is email-ready — can be passed directly to any mailer
      html_body: { type: String, default: '' },

      // Short plain-text preview shown in the template card list
      text_preview: { type: String, default: '', maxlength: 300 },

      // Full GrapesJS project JSON — editor.getProjectData()
      // Mixed type: stores any structure GrapesJS exports without constraints.
      // Load back with: editor.loadProjectData(doc.content.grapesjs_data)
      grapesjs_data: { type: Schema.Types.Mixed, default: null },

      // Email subject line (only relevant for email channel)
      subject: { type: String, trim: true, default: '' },
    },

    // ── Access Control ──────────────────────────────────────────────────────
    // visible_to:  who can see this template in the list
    //   "all"      → all authenticated users
    //   "admin"    → admin role only
    visible_to: {
      type: [String],
      default: ['all'],
    },

    // editable_by: who can open the editor and save changes
    //   "all"      → any user who can see the template
    //   "admin"    → admin role only
    editable_by: {
      type: [String],
      default: ['admin'],
    },

    // ── Ownership ───────────────────────────────────────────────────────────
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Full Edit Timeline ───────────────────────────────────────────────────
    // Every save pushes a new entry so you can see the complete audit trail.
    // Example: [{ edited_by: ObjectId, edited_at: Date, change_note: "..." }]
    edit_history: {
      type: [editHistorySchema],
      default: [],
    },
  },
  {
    // Mongoose auto-manages createdAt + updatedAt
    timestamps: true,
  }
);

// Index for fast listing by channel and status
templateSchema.index({ channel_type: 1 });
templateSchema.index({ status: 1 });
templateSchema.index({ created_by: 1 });

const Template = mongoose.model('Template', templateSchema);

export default Template;
