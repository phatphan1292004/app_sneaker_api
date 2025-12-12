import { Address } from "../../models/Address";

export class AddressService {
  async addAddress(addressData: {
    user_id: string;
    type: string;
    street: string;
    province: string;
    district: string;
    ward: string;
    isDefault?: boolean;
  }) {
    try {
      const address = new Address(addressData);
      await address.save();
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
      const addresses = await Address.find({ user_id });
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
}
