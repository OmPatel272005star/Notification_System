import mongoose from 'mongoose'

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    channel_type: {
        type: String,
        enum: ['email', 'sms', 'whatsapp'],
        required: true
    },

    status: {
        type: String,
        enum: ['draft', 'active', 'archived'],
        default: 'draft'
    },

    content: {
        html_body: {
            type: String
        },

        text_body: {
            type: String
        },

        design_json: {
            type: mongoose.Schema.Types.Mixed
        }
    },

    updated_at: [
        {
            date: {
                type: Date,
                default: Date.now
            },

            updated_by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ]
})

const Template = mongoose.model('Template', templateSchema)

export default Template
