import { Notification } from "../../models/Notification";
import { User } from "../../models/User";

export class NotificationService {
  // firebaseUid -> user document
  private async getUserByFirebaseUid(firebaseUid: string) {
    const user = await User.findOne({ firebaseUid });
    if (!user) throw new Error("User not found");
    return user;
  }

  async getAll(firebaseUid: string) {
    const user = await this.getUserByFirebaseUid(firebaseUid);

    const notifications = await Notification.find({ user_id: user._id }).sort({
      createdAt: -1,
    });

    return { success: true, data: notifications };
  }

  async countUnread(firebaseUid: string) {
    const user = await this.getUserByFirebaseUid(firebaseUid);

    const count = await Notification.countDocuments({
      user_id: user._id,
      isRead: false,
    });

    return { success: true, count };
  }

  async markAsRead(notificationId: string) {
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    return { success: true };
  }

  async remove(notificationId: string) {
    await Notification.findByIdAndDelete(notificationId);
    return { success: true };
  }

  // ✅ 1) create bằng mongo userId (ObjectId string)
  async createByUserId(userId: string, title: string, message: string) {
    const notification = await Notification.create({
      user_id: userId,
      title,
      message,
      isRead: false,
    });

    return { success: true, data: notification };
  }

  // ✅ 2) create bằng firebaseUid (an toàn cho Order vì order.user_id đang là firebaseUid)
  async createByFirebaseUid(
    firebaseUid: string,
    title: string,
    message: string
  ) {
    const user = await this.getUserByFirebaseUid(firebaseUid);

    const notification = await Notification.create({
      user_id: user._id,
      title,
      message,
      isRead: false,
    });

    return { success: true, data: notification };
  }
}
