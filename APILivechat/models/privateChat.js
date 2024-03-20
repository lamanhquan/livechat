// models/privateChat.js
import mongoose from "mongoose";

const privateChatSchema = new mongoose.Schema({
  group_id: {
    type: Number,
    default: 0,
  },
  messages: [
    {
      receivedID: { type: String, required: true },
      content: String,
    },
    {
      senderID: { type: String, required: true },
      content: String,
    },
    {
      created_at: {
        type: Number,
        required: true,
      },
    },
    {
      content: {
        type: String,
        required: true,
      },
    },
    {
      lock: {
        // Nếu không bắt chat, cuộc trò chuyện bị khóa tạm thời lock = 1
        type: Number,
        default: 0,
      },
    },
  ],
});

const PrivateChat = mongoose.model("PrivateChat", privateChatSchema);

export default PrivateChat;
