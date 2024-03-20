import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  chatGroupId: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  messages: {
    type: String,
    required: true,
  },
  created_at:  {
    type: Number,
    required: true,
  },
  status : {     // 1: Mới gửi, công khai vào nhóm chung, 2: Tin nhắn riêng, 3: Bị lỡ sau 30s k được phản hồi
    type: Number,
    default: 1,
  }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
