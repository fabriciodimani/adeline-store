const router = require("express").Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { getBucket } = require("../utils/gridfs");

function mapProduct(p) {
  const obj = p.toObject ? p.toObject() : p;

  return {
    ...obj,
    imageIds: obj.imageIds || [],
    images: obj.images || [],
  };
}

/*
  IMPORTANTE:
  Esta ruta tiene que estar ANTES de "/:id"
*/
router.get("/image/:id", async (req, res) => {
  try {
    const bucket = getBucket();
    const _id = new mongoose.Types.ObjectId(req.params.id);

    const files = await bucket.find({ _id }).toArray();

    if (!files.length) {
      return res.status(404).end();
    }

    res.set("Content-Type", files[0].contentType || "image/jpeg");
    bucket.openDownloadStream(_id).pipe(res);
  } catch (err) {
    console.error("[products] image error:", err);

    res.status(400).json({
      ok: false,
      error: "Imagen inválida",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const items = await Product.find({ publicado: true }).sort({ createdAt: -1 });

    res.json({
      ok: true,
      items: items.map(mapProduct),
    });
  } catch (err) {
    console.error("[products] get error:", err);

    res.status(500).json({
      ok: false,
      error: "No se pudieron obtener productos",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const q = mongoose.isValidObjectId(req.params.id)
      ? { _id: req.params.id }
      : { codigo: req.params.id };

    const item = await Product.findOne({ ...q, publicado: true });

    if (!item) {
      return res.status(404).json({
        ok: false,
        error: "Producto no encontrado",
      });
    }

    res.json({
      ok: true,
      item: mapProduct(item),
    });
  } catch (err) {
    console.error("[products] get one error:", err);

    res.status(500).json({
      ok: false,
      error: "No se pudo obtener el producto",
    });
  }
});

module.exports = router;