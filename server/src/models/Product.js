const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  sku: { type: String, required: true },
  stock: { type: Number, default: 0 }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true, trim: true },
  nombre: { type: String, required: true, trim: true },
  tipo: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  precioCompra: { type: Number, default: 0 },
  precioVenta: { type: Number, default: 0 },
  images: { type: [String], default: [] },
  imageIds: { type: [String], default: [] },
  badge: { type: String, default: '' },
  publicado: { type: Boolean, default: true },
  variants: { type: [VariantSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
