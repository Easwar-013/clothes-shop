import mongoose from 'mongoose';

// Clear cached model in dev
if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Order;
}

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    userName: { type: String, default: 'Customer' },
    userEmail: { type: String, default: '' },
    items: [
      {
        product: { type: mongoose.Schema.Types.Mixed },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        size: { type: String, default: 'M' },
        color: { type: String, default: 'Default' },
      },
    ],
    shippingAddress: {
      phone: { type: String, default: '' },
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Standard Test Payment' },
    isPaid: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);