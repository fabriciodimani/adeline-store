const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

function generateOrderCode() {
  const now = new Date();

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");

  const time = String(now.getTime()).slice(-6);
  const rnd = Math.floor(Math.random() * 900 + 100);

  return `AD-${y}${m}${d}-${time}${rnd}`;
}

function normalizePaymentMethod(value) {
  const v = String(value || "TRANSFERENCIA").toUpperCase();

  if (v === "TRANSFERENCIA") return "TRANSFERENCIA";
  if (v === "TARJETA") return "TARJETA";
  if (v === "MERCADO_PAGO") return "MERCADO_PAGO";
  if (v === "EFECTIVO") return "EFECTIVO";

  return "TRANSFERENCIA";
}

function productName(p) {
  return p?.name || p?.nombre || "Producto";
}

function productPrice(p) {
  return Number(p?.price || p?.precioVenta || 0);
}

function buildVariantFilter(item) {
  const sku = item.sku || "";
  const size = item.size || "";
  const color = item.color || "";

  if (sku) {
    return { sku };
  }

  return { size, color };
}

async function rollbackStock(applied) {
  for (const a of applied.reverse()) {
    const filter = buildVariantFilter(a);

    await Product.updateOne(
      {
        _id: a.productId,
        variants: { $elemMatch: filter },
      },
      {
        $inc: { "variants.$.stock": Number(a.qty || 0) },
      }
    );
  }
}

router.post("/", async (req, res) => {
  const appliedStock = [];

  try {
    const { customer, paymentMethod, items } = req.body || {};

    if (
      !customer?.nombre ||
      !customer?.telefono ||
      !customer?.email ||
      !customer?.direccion
    ) {
      return res.status(400).json({
        ok: false,
        error: "Faltan datos del comprador",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "El carrito está vacío",
      });
    }

    const normalizedItems = [];
    let total = 0;

    for (const item of items) {
      const productId = item.productId;
      const qty = Number(item.qty || 1);
      const size = item.size || "";
      const color = item.color || "";
      const sku = item.sku || "";

      if (!productId) {
        throw new Error(`Falta productId en ${item.name || item.nombre || "producto"}`);
      }

      if (qty <= 0) {
        throw new Error("La cantidad debe ser mayor a cero");
      }

      const product = await Product.findById(productId);

      if (!product) {
        throw new Error(`Producto no encontrado: ${item.name || item.nombre || productId}`);
      }

      const variants = Array.isArray(product.variants) ? product.variants : [];

      const variant = variants.find((v) => {
        const sameSku = sku && v.sku === sku;
        const sameSizeColor = v.size === size && v.color === color;
        return sameSku || sameSizeColor;
      });

      if (!variant) {
        throw new Error(
          `No existe la variante ${size} / ${color} de ${productName(product)}`
        );
      }

      const currentStock = Number(variant.stock || 0);

      if (currentStock < qty) {
        throw new Error(
          `Sin stock para ${productName(product)} ${size}/${color}`
        );
      }

      const variantFilter = {
        ...buildVariantFilter(item),
        stock: { $gte: qty },
      };

      const updated = await Product.findOneAndUpdate(
        {
          _id: productId,
          variants: { $elemMatch: variantFilter },
        },
        {
          $inc: { "variants.$.stock": -qty },
        },
        { new: true }
      );

      if (!updated) {
        throw new Error(
          `Sin stock para ${productName(product)} ${size}/${color}`
        );
      }

      appliedStock.push({
        productId,
        sku,
        size,
        color,
        qty,
      });

      const price = Number(
        item.price ||
          item.precioVenta ||
          productPrice(product)
      );

      normalizedItems.push({
        productId: product._id,
        sku,
        name: item.name || item.nombre || productName(product),
        size,
        color,
        qty,
        price,
        image: item.image || "",
      });

      total += price * qty;
    }

    const order = await Order.create({
      code: generateOrderCode(),
      customer,
      paymentMethod: normalizePaymentMethod(paymentMethod),
      items: normalizedItems,
      subtotal: total,
      total,
      status: "PENDIENTE",
    });

    return res.status(201).json({
      ok: true,
      item: order,
    });
  } catch (err) {
    console.error("[orders] error:", err);

    if (appliedStock.length > 0) {
      try {
        await rollbackStock(appliedStock);
      } catch (rollbackErr) {
        console.error("[orders] rollback error:", rollbackErr);
      }
    }

    return res.status(400).json({
      ok: false,
      error: err.message || "No se pudo confirmar el pedido",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const items = await Order.find().sort({ createdAt: -1 });
    res.json({ ok: true, items });
  } catch (err) {
    console.error("[orders] get error:", err);

    res.status(500).json({
      ok: false,
      error: "No se pudieron obtener los pedidos",
    });
  }
});

module.exports = router;