import mongoose from 'mongoose'

const connectionSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        require: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    channel_type: Enum[               // ENUM — determines which sub-doc is active
        "email",
        "sms",
        "whatsapp",
        "rcs",
        "voice",
        "web_push",
        "mobile_push"
    ],
    channel_config: {
        email: {                        // present when channel_type = "email"
            api_key: String,              // encrypted at rest
            sender_email: String,
            sender_name: String,
            smtp_host: String,
            smtp_port: Number,
            smtp_user: String,
            smtp_pass: String,            // encrypted
            daily_limit: Number,
            webhook_url: String           // for bounce / delivery callbacks
        },
    }
})

const Connection = mongoose.model("Connection",connectionSchema);

export default Connection
