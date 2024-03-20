import mongoose from "mongoose";

const chatGroupSchema = new mongoose.Schema({
  chatGroupId: {
    type: Number,
    default: 0,
  },
  members: [
    {
      type: String,
      required: true,
    },
  ],
  name: {
    type: String,
    required: true,
  },
  responseTime: {
    type: Number,
    default: 30, // Thời gian mặc định để trả lời (đơn vị: giây)
  },
  messages: [
    {
      senderID: {
        type: String,
        required: true,
      },
    },
    {
      expirationTime: {
        type: Date,
        // Đặt thời gian sống cho tin nhắn là 24 giờ sau khi tạo
        default: () => new Date(+new Date() + 24 * 60 * 60 * 1000),
      },
    },
    {
      content: {
        type: String,
        required: true,
      },
    },
    {
      id: {
        type: String,
        required: true,
      },
    },
  ],

  // Các thông tin khác về nhóm live chat
});

const ChatGroup = mongoose.model("ChatGroup", chatGroupSchema);

export default ChatGroup;
