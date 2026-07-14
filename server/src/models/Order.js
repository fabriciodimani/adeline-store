const { Schema, model } = require("mongoose");

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, default: "" },
    name: { type: String, required: true },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const CustomerSchema = new Schema(
  {
    nombre: { type: String, required: true },
    telefono: { type: String, required: true },
    email: { type: String, required: true },
    direccion: { type: String, required: true },
    nota: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customer: { type: CustomerSchema, required: true },

    items: {
      type: [OrderItemSchema],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "El pedido debe tener al menos una prenda",
      },
    },

    paymentMethod: {
      type: String,
      enum: ["TRANSFERENCIA", "TARJETA", "MERCADO_PAGO", "EFECTIVO"],
      default: "TRANSFERENCIA",
    },

    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["PENDIENTE", "PAGADO", "CANCELADO", "ENTREGADO"],
      default: "PENDIENTE",
    },
  },
  { timestamps: true }
);

module.exports = model("Order", OrderSchema);