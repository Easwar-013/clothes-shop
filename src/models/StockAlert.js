import mongoose from 'mongoose';

const StockAlertSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  email: { type: String, required: true },
  isNotified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.StockAlert || mongoose.model('StockAlert', StockAlertSchema);