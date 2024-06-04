import mongoose from "mongoose";



const messageSchema = new mongoose.Schema({
    content: {
        type: String, // we didn't specify the required field here because we want to allow empty messages and if the user just sends attachments
    },        

    attachments: [
        {
            public_id: {
                type: String,
                // required: true
            },
            url: {
                type: String,
                // required: true
            }
        }
    ],

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    }
}, {
    timestamps: true
});

export const Message = mongoose.model('Message', messageSchema);