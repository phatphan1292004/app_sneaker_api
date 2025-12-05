import { User } from "../../models";

export class UserService {
  async createUser(userData: {
    firebaseUid: string;
    username: string;
    email: string;
    avatar?: string;
    phoneNumber?: string;
  }) {
    try {
      // Kiểm tra xem user đã tồn tại chưa
      const existingUser = await User.findOne({ 
        $or: [
          { firebaseUid: userData.firebaseUid },
          { email: userData.email }
        ]
      });

      if (existingUser) {
        return {
          success: false,
          message: "User already exists",
          data: existingUser,
        };
      }

      // Tạo user mới
      const newUser = new User(userData);
      await newUser.save();

      return {
        success: true,
        data: newUser,
      };
    } catch (error: any) {
      console.error("Error in createUser:", error);
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async getUserById(id: string) {
    try {
      const user = await User.findById(id);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error: any) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }


}
