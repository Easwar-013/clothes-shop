import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

export default mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);