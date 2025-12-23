import { Address } from "../../models/Address";

export class AddressService {
  async addAddress(data: {
    user_id: string;
    type: string;
    street: string;
    province: string;
    district: string;
    ward: string;
    isDefault?: boolean;
  }) {
    try {
      // Nếu set default → bỏ default cũ
      if (data.isDefault) {
        await Address.updateMany(
          { user_id: data.user_id },
          { isDefault: false }
        );
      }

      const address = await Address.create(data);

      return {
        success: true,
        data: address,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async getAddressesByUserId(user_id: string) {
    try {
      const addresses = await Address.find({ user_id }).sort({
        isDefault: -1,
        createdAt: -1,
      });

      return {
        success: true,
        data: addresses,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async setDefaultAddress(user_id: string, addressId: string) {
    try {
      await Address.updateMany({ user_id }, { isDefault: false });

      const address = await Address.findByIdAndUpdate(
        addressId,
        { isDefault: true },
        { new: true }
      );

      if (!address) {
        return { success: false, message: "Address not found" };
      }

      return {
        success: true,
        data: address,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 🔹 Xóa địa chỉ
  async deleteAddress(addressId: string) {
    try {
      const address = await Address.findByIdAndDelete(addressId);
      if (!address) return { success: false, message: "Address not found" };
      return { success: true, data: address };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}
