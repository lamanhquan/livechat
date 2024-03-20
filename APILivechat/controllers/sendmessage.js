import ChatGroup from "../models/chatGroup.js";
import ChatMessage from"../models/chatMessage.js";
import PrivateChat from"../models/privateChat.js";

// Lấy danh sách tin nhắn trong cuộc trò chuyện chung
// export const getChatGroupMessages = async (req, res) => {
//   try {
//     const { chatGroupId } = req.body;
//     // Tìm cuộc trò chuyện chung dựa trên tên hoặc ID
//     const chatmessage = await ChatMessage.findOne({ chatGroupId: chatGroupId, status: 1 || 3 });

//     if (!chatmessage) {
//       return res.status(404).json({ error: "Cuộc trò chuyện không tồn tại" });
//     }

//     // Trả về danh sách tin nhắn trong cuộc trò chuyện chung
//     const messages = chatmessage.messages;
//     return res.status(200).json({ messages });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "Lỗi khi lấy tin nhắn cuộc trò chuyện chung" });
//   }
// };
const chatTimeouts = {};
// Người dùng gửi tin nhắn
export const sendMessage = async (req, res) => {
  try {
    const { message, senderId } = req.body;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const chatmessage = await PrivateChat.findOne({
      messages: {
        $elemMatch: {
          senderID: senderId,
          created_at: { $gte: twentyFourHoursAgo },
        },
      },
    });
    if (!chatmessage) {
      // const chatgroup = ChatGroup.findOne().lean();
      const created_at = new Date().getTime();
      // Thêm tin nhắn vào cuộc trò chuyện chung
      const newMessage = new ChatMessage({
        sender: senderId,
        messages: message,
        created_at: created_at,
        chatGroupId: -1,
        status: 1,
      });
      
      await newMessage.save();
      // const newChat = new ChatGroup({
      //   participants: [{ senderID: senderId }, { content: message }, id],
      // });
      // await newChat.save();
      return res.status(404).json({ message: "Thêm tin nhắn vào cuộc trò chuyện chung" });
    } else {
      const created_at = new Date().getTime();
      // Thêm tin nhắn vào cuộc trò riêng
      const newMessage = new ChatMessage({
        sender: senderId,
        messages: message,
        created_at: created_at,
        chatGroupId: chatmessage.group_id,
        status: 2,
      });
      await newMessage.save();
      
      // const newChat = new PrivateChat({
      //   messages: [
      //     { senderID: senderId },
      //     { content: message },
      //     newMessage._id,
      //   ],
      // });

      chatmessage.messages.push({
        senderID: senderId,
        receivedID: chatmessage.messages[0].receivedID,
        content: message,
        created_at: created_at,
      });
      await chatmessage.save();

      // Tạo hẹn giờ cho cuộc trò chuyện
      chatTimeouts[newMessage._id] = setTimeout(async () => {
        // Kiểm tra xem cuộc trò chuyện đã được trả lời chưa
    
          await ChatMessage.findByIdAndUpdate(newMessage._id, {
            status: 3,
            created_at: created_at,
          });
          await PrivateChat.updateMany(
            { messages: [{ senderID: senderId }] },
            { lock: 1 }
          );
      }, 30000); // Hẹn giờ trong 30 giây
    }

    return res.status(201).json({ message: "Tin nhắn đã được gửi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi gửi tin nhắn" });
  }
};

// Thêm thành viên vào nhóm live chat
export const addMemberToChatGroup = async (req, res) => {
  try {
    const { chatGroupId, memberId } = req.body;

    // Kiểm tra xem chatGroupId và memberId có hợp lệ không
    if (!chatGroupId || !memberId) {
      return res
        .status(400)
        .json({ error: "Chat group ID và member ID là bắt buộc" });
    }

    // Kiểm tra xem chatGroupId có tồn tại không
    const chatGroup = await ChatGroup.findById(chatGroupId);

    if (!chatGroup) {
      return res.status(404).json({ error: "Chat group không tồn tại" });
    }

    // Kiểm tra xem memberId có tồn tại không
    const member = await User.findById(memberId);

    if (!member) {
      return res.status(404).json({ error: "Thành viên không tồn tại" });
    }

    // Kiểm tra xem thành viên đã tồn tại trong nhóm chưa
    if (chatGroup.members.includes(memberId)) {
      return res
        .status(400)
        .json({ error: "Thành viên đã tồn tại trong nhóm" });
    }

    // Thêm memberId vào danh sách thành viên của nhóm
    chatGroup.members.push(memberId);
    await chatGroup.save();

    return res
      .status(201)
      .json({ message: "Thêm thành viên vào nhóm thành công" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Lỗi khi thêm thành viên vào nhóm live chat" });
  }
};

// // Cài đặt thời gian trả lời
// export const setResponseTime = async (req, res) => {
//   try {
//     const { chatGroupId, responseTime } = req.body;

//     // Kiểm tra xem chatGroupId có hợp lệ không
//     if (!chatGroupId) {
//       return res.status(400).json({ error: "Chat group ID là bắt buộc" });
//     }

//     // Kiểm tra xem chatGroupId có tồn tại không
//     const chatGroup = await ChatGroup.findById(chatGroupId);

//     if (!chatGroup) {
//       return res.status(404).json({ error: "Chat group không tồn tại" });
//     }

//     // Cập nhật thời gian trả lời cho nhóm
//     chatGroup.responseTime = responseTime;
//     await chatGroup.save();

//     return res
//       .status(200)
//       .json({ message: "Cài đặt thời gian trả lời thành công" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Lỗi khi cài đặt thời gian trả lời" });
//   }
// };
