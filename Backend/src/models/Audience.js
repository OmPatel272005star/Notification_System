import mongoose from 'mongoose'

const audienceSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true,
            trim: true
        },

        last_name: {
            type: String,
            required: true,
            trim: true
        },

        dob: {
            type: Date
        },

        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer_not_to_say']
        },

        emails: [
            {
                email: {
                    type: String,
                    required: true,
                    unique: true,
                    trim: true,
                    lowercase: true
                },

                is_primary: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        phone_numbers: [
            {
                phone_code: {
                    type: String,
                    required: true,
                    trim: true
                },

                number: {
                    type: String,
                    required: true,
                    trim: true
                },

                is_primary: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        address: {
            house_number: String,
            locality: String,
            city: String,
            state: String,
            country: String,
            zip_code: String
        },

        social_media_handles: [
            {
                type: String,
                enum: ['email', 'sms', 'whatsapp']
            }
        ]
    },
    {
        timestamps: true
    }
)

const Audience = mongoose.model('Audience', audienceSchema)

export default Audience