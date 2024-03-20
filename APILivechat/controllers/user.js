import User from "../models/users.js";
import bcrypt from 'bcrypt';

export const signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo một bản ghi User mới
    const newUser = new User({ username, password: hashedPassword });

    // Nếu user_id chưa được đặt giá trị
    if (!newUser.user_id) {
      // Tìm bản ghi có user_id lớn nhất
      const maxUserIdRecord = await User.findOne().sort("-user_id").exec();

      // Nếu không có bản ghi nào, đặt giá trị user_id bằng 1
      newUser.user_id = maxUserIdRecord ? maxUserIdRecord.user_id + 1 : 1;
    }
    // Lưu bản ghi vào cơ sở dữ liệu
    await newUser.save();
    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "Tên đăng nhập không tồn tại" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    res.status(200).json({ user_id: user.user_id, username: user.username, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
