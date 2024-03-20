import {
  // setResponseTime,
  addMemberToChatGroup,
  // getChatGroupMessages,
  sendMessage,
} from "../controllers/sendmessage.js";
import {
  getGroupchatList,
  getPrivatechatList,
  getMessageUser,
  startPrivateChat,
  replyToMessage
} from "../controllers/creatnewlivechat.js";
import { login } from "../controllers/user.js";
import { signup } from "../controllers/user.js";
import express from "express";
import formData from "express-form-data";
const router = express.Router();

// router.post("/setResponseTime", formData.parse(), setResponseTime);
router.post("/addMemberToChatGroup", formData.parse(), addMemberToChatGroup);
// router.post("/sendMessageToChatGroup", formData.parse(), sendMessageToChatGroup);
router.post("/login", formData.parse(), login);
router.post("/signup", formData.parse(), signup);
// router.post("/getChatGroupMessages", formData.parse(), getChatGroupMessages);
router.post("/getGroupchatList", formData.parse(), getGroupchatList);
router.post("/getPrivatechatList", formData.parse(), getPrivatechatList);
router.post("/getMessageUser", formData.parse(), getMessageUser);
router.post("/sendMessage", formData.parse(), sendMessage);
router.post("/startPrivateChat", formData.parse(), startPrivateChat);
router.post("/replyToMessage", formData.parse(), replyToMessage);



export default router;
