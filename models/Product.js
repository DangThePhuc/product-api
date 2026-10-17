const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    pid: { type: String, required: true, unique: true, trim: false },
    pname: { type: String, required: true, trim: true },
    price: { type: Number, required: false, min: 0 },
    quantity: { type: Number, required: false, min: 0, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);