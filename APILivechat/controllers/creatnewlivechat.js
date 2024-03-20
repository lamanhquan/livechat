// controllers/chatController.js
import ChatMessage from "../models/chatMessage.js";
import PrivateChat from "../models/privateChat.js";
// Bắt đầu cuộc trò chuyện riêng giữa hai người
export const startPrivateChat = async (req, res) => {
  try {
    const { receivedID, senderID, message, mess_id } = req.body;

    // Kiểm tra xem senderID và receivedID có hợp lệ không
    if (!senderID || !receivedID) {
      return res
        .status(400)
        .json({ error: "senderID và receivedID là bắt buộc" });
    }

    // Kiểm tra xem cuộc trò chuyện riêng giữa nhân viên và khách hàng đã tồn tại chưa
    const existingChat = await PrivateChat.findOne({
      messages: {
        $elemMatch: {
          $or: [
            { senderID: senderID, receivedID: receivedID },
            { senderID: receivedID, receivedID: senderID },
          ],
        },
      },
    });

    if (existingChat) {
      // cập nhật tin nhắn vào cuộc trò chuyện riêng
      const created_at = new Date().getTime();
      existingChat.messages.push({
        receivedID: receivedID,
        senderID: senderID,
        created_at: created_at,
        content: message,
      });

      await existingChat.save();
      // ẩn tin nhắn khỏi nhóm chung
      await ChatMessage.findByIdAndUpdate(mess_id, { status: 2 });
      await PrivateChat.updateMany(
        { messages: [{ senderID: senderID }] },
        { lock: 0 }
      );

      chatTimeouts[mess_id] = setTimeout(async () => {
        // Kiểm tra xem cuộc trò chuyện đã được trả lời chưa

        await ChatMessage.findByIdAndUpdate(mess_id, {
          status: 3,
          created_at: created_at,
        });
        await PrivateChat.updateMany(
          { messages: [{ senderID: senderID }] },
          { lock: 1 }
        );
      }, 30000); // Hẹn giờ trong 30 giây
      return res.status(200).json({
        result: true,
        message: "Cuộc trò chuyện riêng đã tồn tại trước đó",
        data: existingChat,
        error: null,
      });
    } else {
      // ẩn tin nhắn khỏi nhóm chung
      await ChatMessage.findByIdAndUpdate(mess_id, { status: 2 });
      // Tạo cuộc trò chuyện riêng mới
      const created_at = new Date().getTime();
      const newChat = new PrivateChat({
        message: [
          { senderID: senderID },
          { receivedID: receivedID },
          { content: message },
          { created_at: created_at },
        ],
      });
      newChat.messages.push({
        receivedID: receivedID,
        senderID: senderID,
        created_at: created_at,
        content: message,
      });
      await newChat.save();
      chatTimeouts[mess_id] = setTimeout(async () => {
        // Kiểm tra xem cuộc trò chuyện đã được trả lời chưa

        await ChatMessage.findByIdAndUpdate(mess_id, {
          status: 3,
          created_at: created_at,
        });
        await PrivateChat.updateMany(
          { messages: [{ senderID: senderID }] },
          { lock: 1 }
        );
      }, 30000); // Hẹn giờ trong 30 giây
    }

    return res
      .status(201)
      .json({ message: "Bắt đầu cuộc trò chuyện riêng thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi bắt đầu cuộc trò chuyện riêng" });
  }
};

// Trả lời tin nhắn khách hàng
export const replyToMessage = async (req, res) => {
  try {
    const { senderId, message, group_id } = req.body;

    // Kiểm tra các thông tin cần thiết
    if (!senderId || !message) {
      return res.status(400).json({ error: "Thiếu thông tin cần thiết." });
    }

    const newMessage = {
      senderID: senderId,
      // receivedID: receivedID,
      content: message,
      created_at: Date.now(),
    };

    // Tìm và cập nhật tin nhắn PrivateChat

    const updatedChat = await PrivateChat.findOneAndUpdate(
      { group_id: group_id },
      { $addToSet: { messages: newMessage } },
      { new: true } // Trả về bản ghi đã được cập nhật
    );

    return res.status(201).json({ message: "Gửi tin nhắn thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gửi tin thất bại" });
  }
};
// Danh sách tin nhắn private

export const getPrivatechatList = async (req, res) => {
  try {
    let { page, limit, userID } = req.body;
    if (!page) page = 1;
    if (!limit) limit = 10;
    let skip = limit * (page - 1);
    let data = await PrivateChat.find({
      messages: {
        $elemMatch: {
          $or: [
            { senderID: String(userID) },
            { receivedID: String(userID) }
          ]
        }
      }
    })
    .sort({ "messages.created_at": 1 })
    .skip(skip)
    .limit(limit)
    .lean();
    {
      return res
        .status(201)
        .json({ message: "Danh sách tin nhắn", data: data });
    }
  } catch (e) {
    console.log(e);
    return res.status(201).jsonr(res, e.message);
  }
};

// Danh sách tin nhắn nhóm chung

export const getGroupchatList = async (req, res) => {
  try {
    let page, limit;
    // let { chatGroupId } = req.body;
    if (!page) page = 1;
    if (!limit) limit = 10;
    let skip = limit * (page - 1);
    let data = await ChatMessage.find({
      // group_id: chatGroupId,
      $or: [{ status: 1 }, { status: 3 }],
    })
      .sort({ created_at: 1 })
      .skip(skip)
      .limit(limit) // Giới hạn số bản ghi trên mỗi trang
      .lean();
    {
      return res
        .status(200)
        .json({ message: "Danh sách tin nhắn", data: data });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: e.message });
  }
};

// Danh sách tin nhắn nhóm chung theo user_id

export const getMessageUser = async (req, res) => {
  try {
    let page, limit;
    let { chatGroupId, sender } = req.body;
    if (!page) page = 1;
    if (!limit) limit = 10;
    let skip = limit * (page - 1);
    let data = await ChatMessage.find({
      group_id: chatGroupId,
      sender: sender,
      $or: [{ status: 1 }, { status: 3 }],
    })
      .sort({ created_at: 1 })
      .skip(skip)
      .limit(limit) // Giới hạn số bản ghi trên mỗi trang
      .lean();
    {
      return res
        .status(200)
        .json({ message: "Danh sách tin nhắn", data: data });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: e.message });
  }
};

// Dừng cuộc trò chuyện

// Thống kê lịch sử trò chuyện bằng tài khoản nhân viên

// Thống kê lịch sử trò chuyện bằng tài khoản công ti

const chatTimeouts = {};

// Endpoint để bắt đầu cuộc trò chuyện
export const startChat = async (req, res) => {
  try {
    const { toUser_id, chat_id } = req.body;

    // Tạo hẹn giờ cho cuộc trò chuyện
    chatTimeouts[chat_id] = setTimeout(() => {
      // Kiểm tra xem cuộc trò chuyện đã được trả lời chưa
      if (!isAnswered(chat_id)) {
        // Gửi tin nhắn trở lại vào nhóm chung (ví dụ: thông báo cuộc trò chuyện hết thời gian)
        sendToGroupChat(
          chat_id,
          "Cuộc trò chuyện đã kết thúc do không nhận được phản hồi."
        );
      }
    }, 30000); // Hẹn giờ trong 30 giây

    res.status(200).send("Cuộc trò chuyện đã bắt đầu.");
  } catch (error) {
    console.error("Lỗi trong quá trình bắt đầu cuộc trò chuyện:", error);
    res.status(500).send("Có lỗi xảy ra.");
  }
};

// Endpoint để trả lời tin nhắn
export const answerChat = async (req, res) => {
  try {
    const { chat_id } = req.body;

    // Hủy bỏ hẹn giờ nếu cuộc trò chuyện đã được trả lời
    clearTimeout(chatTimeouts[chat_id]);

    // Xử lý việc trả lời tin nhắn
    // ...

    res.status(200).send("Tin nhắn đã được trả lời.");
  } catch (error) {
    console.error("Lỗi trong quá trình trả lời tin nhắn:", error);
    res.status(500).send("Có lỗi xảy ra.");
  }
};

// function isAnswered(chat_id) {
//   // Kiểm tra xem cuộc trò chuyện đã được trả lời hay chưa
//   // Trả về true nếu đã trả lời, ngược lại trả về false
// }

// function sendToGroupChat(chat_id, message) {
//   // Gửi tin nhắn trở lại vào nhóm chung (ví dụ: thông báo cuộc trò chuyện hết thời gian)
//   // ...

//   console.log(`[Group Chat] ${message}`);
// }
