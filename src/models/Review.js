import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [{ type: String }], // Array of base64 image strings
    isVerifiedBuyer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Delete old cached model to force schema refresh in Next.js development
if (mongoose.models.Review) {
  delete mongoose.models.Review;
}

export default mongoose.model('Review', ReviewSchema);