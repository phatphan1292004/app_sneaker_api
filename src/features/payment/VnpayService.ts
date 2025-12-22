import crypto from "crypto";
import { OrderService } from "../order/OrderService";

const orderService = new OrderService();

export class VnpayService {
  private static encodeQueryData(data: Record<string, any>) {
    const sorted: Record<string, any> = {};
    Object.keys(data)
      .sort()
      .forEach((key) => {
        if (data[key] !== "" && data[key] !== undefined && data[key] !== null) {
          sorted[key] = data[key];
        }
      });

    const signData = Object.keys(sorted)
      .map((key) => {
        return `${key}=${encodeURIComponent(sorted[key].toString()).replace(
          /%20/g,
          "+"
        )}`;
      })
      .join("&");

    return { signData };
  }

  static async createPaymentUrl(orderId: string, ipAddrRaw: string) {
    const vnp_TmnCode = process.env.VNP_TMN_CODE!;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET!;
    const vnp_Url = process.env.VNP_URL!;
    const vnp_ReturnUrl = process.env.VNP_RETURN_URL!;
    if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url || !vnp_ReturnUrl)
      throw new Error("VNPAY env variables missing");

    const orderResult = await orderService.getOrderById(orderId);
    if (!orderResult.success || !orderResult.data)
      throw new Error("Order not found");

    const order = orderResult.data;
    const amount = order.total_amount * 100;
    const createDate = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);
    const txnRef = order._id.toString();
    const ipAddr =
      ipAddrRaw.replace("::ffff:", "").split(",")[0] || "127.0.0.1";

    const vnp_Params: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Amount: amount.toString(),
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${txnRef}`,
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    const { signData } = this.encodeQueryData(vnp_Params);
    const secureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData)
      .digest("hex");

    return `${vnp_Url}?${signData}&vnp_SecureHash=${secureHash}`;
  }

  static async handleReturn(query: any) {
    try {
      const vnp_HashSecret = process.env.VNP_HASH_SECRET!;
      if (!vnp_HashSecret) throw new Error("VNP_HASH_SECRET missing");

      const vnp_Params = { ...query };
      const secureHash = vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      const { signData } = this.encodeQueryData(vnp_Params);
      const checkSum = crypto
        .createHmac("sha512", vnp_HashSecret)
        .update(signData)
        .digest("hex");

      if (secureHash !== checkSum) {
        return { success: false, message: "Invalid signature" };
      }

      const orderId = vnp_Params["vnp_TxnRef"];
      const rspCode = vnp_Params["vnp_ResponseCode"];
      console.log(`Processing Order: ${orderId} with Code: ${rspCode}`);

      if (rspCode === "00") {
        await orderService.updateOrderStatus(orderId, "paid");
        return { success: true, status: "paid", message: "Payment successful" };
      } else {
        await orderService.updateOrderStatus(orderId, "failed");
        return { success: true, status: "failed", message: "Payment failed" };
      }
    } catch (error: any) {
      console.error("HandleReturn Internal Error:", error);
      return {
        success: false,
        message: error.message || "Internal Update Error",
      };
    }
  }
}
