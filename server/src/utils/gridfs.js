const mongoose = require('mongoose');
let bucket = null;
function initGridFS() {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'product_images' });
  console.log('[gridfs] listo');
}
function getBucket() {
  if (!bucket) throw new Error('GridFS no inicializado');
  return bucket;
}
module.exports = { initGridFS, getBucket };
