require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/Product");

async function main() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("Falta MONGO_URI en .env");
  }

  await mongoose.connect(uri);
  console.log("[mongo] conectado");

  const db = mongoose.connection.db;

  const files = await db
    .collection("product_images.files")
    .find({})
    .sort({ uploadDate: 1 })
    .toArray();

  console.log(`[imagenes] encontradas: ${files.length}`);

  let linked = 0;
  let skipped = 0;

  const byProductId = new Map();
  const byCodigo = new Map();

  for (const file of files) {
    const id = String(file._id);

    const productId = file.metadata?.productId
      ? String(file.metadata.productId)
      : "";

    const codigoMeta = file.metadata?.codigo
      ? String(file.metadata.codigo).trim().toUpperCase()
      : "";

    const filename = String(file.filename || "");
    const codigoFromName = filename.split("-").slice(0, 2).join("-").trim().toUpperCase();

    if (productId) {
      if (!byProductId.has(productId)) byProductId.set(productId, []);
      byProductId.get(productId).push(id);
      continue;
    }

    const codigo = codigoMeta || codigoFromName;

    if (codigo) {
      if (!byCodigo.has(codigo)) byCodigo.set(codigo, []);
      byCodigo.get(codigo).push(id);
      continue;
    }

    skipped++;
  }

  for (const [productId, imageIds] of byProductId.entries()) {
    const product = await Product.findById(productId);

    if (!product) {
      skipped += imageIds.length;
      continue;
    }

    product.images = [];
    product.imageIds = imageIds.slice(0, 2);

    await product.save();

    console.log(`[ok] ${product.codigo} ${product.nombre}: ${product.imageIds.length} imagen(es)`);
    linked++;
  }

  for (const [codigo, imageIds] of byCodigo.entries()) {
    const alreadyLinked = await Product.findOne({
      codigo,
      imageIds: { $exists: true, $ne: [] },
    });

    if (alreadyLinked) continue;

    const product = await Product.findOne({ codigo });

    if (!product) {
      skipped += imageIds.length;
      continue;
    }

    product.images = [];
    product.imageIds = imageIds.slice(0, 2);

    await product.save();

    console.log(`[ok] ${product.codigo} ${product.nombre}: ${product.imageIds.length} imagen(es)`);
    linked++;
  }

  console.log("--------------------------------");
  console.log(`Productos vinculados: ${linked}`);
  console.log(`Imágenes sin vincular: ${skipped}`);

  await mongoose.disconnect();
  console.log("[mongo] desconectado");
}

main().catch(async (err) => {
  console.error("[error]", err);
  await mongoose.disconnect();
  process.exit(1);
});