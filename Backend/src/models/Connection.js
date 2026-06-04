import mongoose from 'mongoose';

const connectionSchema = mongoose.Schema({
  name: {
    type:     String,
    trim:     true,
    required: true,
  },
  email: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
    trim:      true,
    index:     true,
    match:     [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  channel_type: {
    type: String,
    enum: ['email', 'sms', 'whatsapp', 'rcs', 'voice', 'web_push', 'mobile_push'],
    required: true,
  },
  channel_config: {
    email: {
      api_key:      String,
      sender_email: String,
      sender_name:  String,
      smtp_host:    String,
      smtp_port:    Number,
      smtp_user:    String,
      smtp_pass:    String,
      daily_limit:  Number,
      webhook_url:  String,
    },
  },
}, { timestamps: true });

const Connection = mongoose.model('Connection', connectionSchema);
export default Connection;
