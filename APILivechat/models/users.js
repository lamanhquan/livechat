import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Các thông tin khác về người dùng
});

const User = mongoose.model('User', userSchema);

export default User;