const router = require("express").Router();
const multer = require("multer");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { getBucket } = require("../utils/gridfs");

const sharp = require("sharp");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

async function optimizeImage(file) {
  const buffer = await sharp(file.buffer)
    .rotate()
    .resize({
      width: 1400,
      height: 1800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 78,
      effort: 4,
    })
    .toBuffer();

  return {
    buffer,
    mimetype: "image/webp",
    originalname: file.originalname.replace(/\.[^.]+$/, ".webp"),
  };
}

function uploadToGridFS(file, filename, metadata = {}) {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();

    const stream = bucket.openUploadStream(filename, {
      contentType: file.mimetype,
      metadata,
    });

    const fileId = stream.id;

    stream.on("finish", () => {
      resolve(String(fileId));
    });

    stream.on("error", (err) => {
      reject(err);
    });

    stream.end(file.buffer);
  });
}

function normalizeCategorias(categorias, tipo) {
  const base = Array.isArray(categorias) ? categorias : [];

  const list = [...base];

  if (tipo && !list.includes(tipo)) {
    list.push(tipo);
  }

  return [...new Set(list.map((c) => String(c || "").trim()).filter(Boolean))];
}

function normalizeVariant(v, codigo) {
  const size = String(v.size || "").trim();
  const color = String(v.color || "").trim();

  return {
    size,
    color,
    sku:
      String(v.sku || "")
        .trim()
        .toUpperCase() ||
      `${codigo}-${size}-${color}`.toUpperCase().replace(/\s+/g, ""),
    stock: Number(v.stock || 0),
  };
}

router.get("/", async (req, res) => {
  try {
    const items = await Product.find({}).sort({ createdAt: -1 });
    res.json({ ok: true, items });
  } catch (err) {
    console.error("[adminProducts] get error:", err);
    res.status(500).json({ ok: false, error: "No se pudieron obtener productos" });
  }
});

router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || "{}");

    if (!data.codigo || !data.nombre) {
      return res.status(400).json({
        ok: false,
        error: "Código y nombre son obligatorios",
      });
    }

    const variants = Array.isArray(data.variants)
      ? data.variants
          .filter((v) => v.size && v.color)
          .map((v) => normalizeVariant(v, data.codigo))
      : [];

    const created = await Product.create({
      codigo: String(data.codigo || "").trim().toUpperCase(),
      nombre: String(data.nombre || "").trim(),
      tipo: data.tipo || "",
      categorias: normalizeCategorias(data.categorias, data.tipo),
      descripcion: data.descripcion || "",
      tablaTalles: data.tablaTalles || "",
      precioCompra: Number(data.precioCompra || 0),
      precioVenta: Number(data.precioVenta || 0),
      badge: data.badge || "",
      publicado: data.publicado !== false,
      variants,
      images: [],
      imageIds: [],
    });

    if (req.files?.length) {
      created.images = [];
      created.imageIds = [];

      for (const file of req.files) {
        const optimized = await optimizeImage(file);

        const id = await uploadToGridFS(
          optimized,
          `${created.codigo}-${Date.now()}-${optimized.originalname}`,
          {
            productId: String(created._id),
            codigo: created.codigo,
            optimized: true,
          }
        );

        created.imageIds.push(id);
      }

      await created.save();
    }

    res.status(201).json({
      ok: true,
      item: created,
    });
  } catch (err) {
    console.error("[adminProducts] post error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        ok: false,
        error: "Ya existe un producto con ese código",
      });
    }

    res.status(400).json({
      ok: false,
      error: err.message || "No se pudo crear el producto",
    });
  }
});

router.put("/:id", upload.array("images", 5), async (req, res) => {
  try {
    const data = req.body.data ? JSON.parse(req.body.data) : req.body;

    if (!data.codigo || !data.nombre) {
      return res.status(400).json({
        ok: false,
        error: "Código y nombre son obligatorios",
      });
    }

    const codigo = String(data.codigo || "").trim().toUpperCase();

    const update = {
      codigo,
      nombre: String(data.nombre || "").trim(),
      tipo: data.tipo || "",
      categorias: normalizeCategorias(data.categorias, data.tipo),
      descripcion: data.descripcion || "",
      tablaTalles: data.tablaTalles || "",
      precioCompra: Number(data.precioCompra || 0),
      precioVenta: Number(data.precioVenta || 0),
      badge: data.badge || "",
      publicado: data.publicado !== false,
      variants: Array.isArray(data.variants)
        ? data.variants
            .filter((v) => v.size && v.color)
            .map((v) => normalizeVariant(v, codigo))
        : [],
    };

    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: "Producto no encontrado",
      });
    }

    // Si sube imágenes nuevas, reemplaza las anteriores
    if (req.files?.length) {
      product.images = [];
      product.imageIds = [];

      for (const file of req.files) {
        const optimized = await optimizeImage(file);

        const id = await uploadToGridFS(
          optimized,
          `${product.codigo}-${Date.now()}-${optimized.originalname}`,
          {
            productId: String(product._id),
            codigo: product.codigo,
            optimized: true,
          }
        );

        product.imageIds.push(id);
      }

      await product.save();
    }

    res.json({
      ok: true,
      item: product,
    });
  } catch (err) {
    console.error("[adminProducts] put error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        ok: false,
        error: "Ya existe un producto con ese código",
      });
    }

    res.status(400).json({
      ok: false,
      error: err.message || "No se pudo actualizar el producto",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: "Producto no encontrado",
      });
    }

    // Borra imágenes de GridFS si existen
    if (Array.isArray(product.imageIds) && product.imageIds.length) {
      const bucket = getBucket();

      for (const imageId of product.imageIds) {
        try {
          await bucket.delete(new mongoose.Types.ObjectId(imageId));
        } catch (imgErr) {
          console.warn("[adminProducts] no se pudo borrar imagen:", imageId);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      ok: true,
      message: "Producto eliminado correctamente",
    });
  } catch (err) {
    console.error("[adminProducts] delete error:", err);

    res.status(400).json({
      ok: false,
      error: err.message || "No se pudo eliminar el producto",
    });
  }
});

module.exports = router;