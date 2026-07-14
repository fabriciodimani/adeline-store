const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

const VALID_STATUS = ["PENDIENTE", "PAGADO", "CANCELADO", "ENTREGADO"];

function buildVariantQuery(item) {
  if (item.sku) return { sku: item.sku };
  return { size: item.size || "", color: item.color || "" };
}

async function restoreStock(order) {
  for (const item of order.items || []) {
    const filter = buildVariantQuery(item);

    await Product.updateOne(
      {
        _id: item.productId,
        variants: { $elemMatch: filter },
      },
      {
        $inc: { "variants.$.stock": Number(item.qty || 0) },
      }
    );
  }
}

router.get("/", async (req, res) => {
  try {
    const items = await Order.find().sort({ createdAt: -1 });

    res.json({
      ok: true,
      items,
    });
  } catch (err) {
    console.error("[adminOrders] get error:", err);

    res.status(500).json({
      ok: false,
      error: "No se pudieron obtener los pedidos",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await Order.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        ok: false,
        error: "Pedido no encontrado",
      });
    }

    res.json({
      ok: true,
      item,
    });
  } catch (err) {
    console.error("[adminOrders] get one error:", err);

    res.status(500).json({
      ok: false,
      error: "No se pudo obtener el pedido",
    });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const nextStatus = String(req.body?.status || "").toUpperCase();

    if (!VALID_STATUS.includes(nextStatus)) {
      return res.status(400).json({
        ok: false,
        error: "Estado inválido",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        ok: false,
        error: "Pedido no encontrado",
      });
    }

    const currentStatus = String(order.status || "PENDIENTE").toUpperCase();

    if (currentStatus === nextStatus) {
      return res.json({
        ok: true,
        item: order,
      });
    }

    if (currentStatus === "CANCELADO") {
      return res.status(400).json({
        ok: false,
        error: "No se puede cambiar el estado de un pedido cancelado",
      });
    }

    if (nextStatus === "CANCELADO") {
      await restoreStock(order);
    }

    order.status = nextStatus;
    await order.save();

    res.json({
      ok: true,
      item: order,
    });
  } catch (err) {
    console.error("[adminOrders] update status error:", err);

    res.status(500).json({
      ok: false,
      error: err.message || "No se pudo actualizar el estado",
    });
  }
});

module.exports = router;