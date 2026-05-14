import mongoose from 'mongoose'

const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    channel_type: Enum[               // determines which delivery worker picks this up
        "email", "sms", "whatsapp"
    ],
    status: {
        type: String,
        enum: [
            'draft',
            'approved',
            'scheduled',
            'processing',
            'completed',
            'failed',
            'cancelled'
        ],
        default: 'draft'
    },
    connection_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection',
        required: true
    },
    template_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true
    },
    audience: {
        audience_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Audience'
            }
        ],
        schedule: {
            send_at: {
                type: Date
            },
        },
        delivery_stats: {

            sent: {
                type: Number,
                default: 0
            },

            delivered: {
                type: Number,
                default: 0
            },

            opened: {
                type: Number,
                default: 0
            },

            clicked: {
                type: Number,
                default: 0
            },

            bounced: {
                type: Number,
                default: 0
            },

            failed: {
                type: Number,
                default: 0
            },
        },
    }
});

const Campaign = mongoose.model('Campaign', campaignSchema)

export default Campaign