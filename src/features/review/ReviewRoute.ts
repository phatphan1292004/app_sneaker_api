import { Router } from 'express';
import ReviewService from './ReviewService';

const router = Router();

// Tạo bình luận mới (bình luận gốc hoặc reply)
router.post('/reviews', async (req, res) => {
  try {
    const { product_id, user_id, content, rating, parent_id } = req.body;
    const review = await ReviewService.createReview({ product_id, user_id, content, rating, parent_id });
    res.status(201).json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Lấy tất cả bình luận của sản phẩm (dạng phẳng)
router.get('/reviews/product/:product_id', async (req, res) => {
  try {
    const reviews = await ReviewService.getReviewsByProduct(req.params.product_id);
    res.json(reviews);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Lấy thread bình luận theo root_id
router.get('/thread/:root_id', async (req, res) => {
  try {
    const reviews = await ReviewService.getReviewThread(req.params.root_id);
    res.json(reviews);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Xóa bình luận (và các reply con)
router.delete('/:review_id', async (req, res) => {
  try {
    const { user_id } = req.body;
    await ReviewService.deleteReview(req.params.review_id, user_id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
