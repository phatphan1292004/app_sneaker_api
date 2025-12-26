import { User } from "../../models/User";

export class ProfileService {
  // Lấy profile theo firebaseUid (dùng khi nhấn Edit)
  async getByFirebaseUid(firebaseUid: string) {
    const user = await User.findOne({ firebaseUid });

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
  }

  // Update profile
  async updateProfile(
    userId: string,
    payload: {
      username?: string;
      phoneNumber?: string;
      birthDate?: string;
      gender?: string;
    }
  ) {
    const updateData: any = {};

    if (payload.username !== undefined) updateData.username = payload.username;

    if (payload.phoneNumber !== undefined)
      updateData.phoneNumber = payload.phoneNumber;

    if (payload.birthDate !== undefined)
      updateData.birthDate = payload.birthDate;

    if (payload.gender !== undefined) updateData.gender = payload.gender;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

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
  }

  async updateAvatar(userId: string, avatar?: string) {
    if (!avatar) {
      return { success: false, message: "avatar is required" };
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar } },
      { new: true }
    );

    if (!user) return { success: false, message: "User not found" };
    return { success: true, data: user };
  }
}
