import Review from '../../models/Review';
import { Types } from 'mongoose';

export default class ReviewService {
  static async createReview({
    product_id,
    user_id,
    content,
    rating,
    parent_id
  }: {
    product_id: string;
    user_id: string;
    content: string;
    rating?: number;
    parent_id?: string;
  }) {
    let level = 0;
    let root_id = null;
    if (parent_id) {
      const parentReview = await Review.findById(parent_id);
      if (!parentReview) throw new Error('Parent review not found');
      level = parentReview.level + 1;
      root_id = parentReview.root_id || parentReview._id;
    }
    const review = await Review.create({
      product_id,
      user_id,
      content,
      rating,
      parent_id: parent_id ? new Types.ObjectId(parent_id) : null,
      root_id: root_id ? new Types.ObjectId(root_id) : null,
      level
    });
    return review;
  }

  static async getReviewsByProduct(product_id: string) {
    // Lấy tất cả review của sản phẩm kèm thông tin user (avatar và username)
    return Review.aggregate([
      {
        $match: { product_id: new Types.ObjectId(product_id) }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: 'firebaseUid',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          product_id: 1,
          user_id: 1,
          content: 1,
          rating: 1,
          parent_id: 1,
          root_id: 1,
          level: 1,
          createdAt: 1,
          updatedAt: 1,
          'user.avatar': 1,
          'user.username': 1
        }
      },
      {
        $sort: { createdAt: 1 }
      }
    ]);
  }

  static async getReviewThread(root_id: string) {
    // Lấy toàn bộ thread bình luận theo root_id
    return Review.find({ root_id: new Types.ObjectId(root_id) })
      .sort({ createdAt: 1 })
      .lean();
  }

  static async deleteReview(review_id: string, user_id: string) {
    // Chỉ cho phép xóa nếu là chủ sở hữu
    const review = await Review.findById(review_id);
    if (!review) throw new Error('Review not found');
    if (review.user_id.toString() !== user_id) throw new Error('Not allowed');
    await Review.deleteOne({ _id: review_id });
    // Optionally: Xóa luôn các reply con
    await Review.deleteMany({ parent_id: review_id });
    return true;
  }
}
