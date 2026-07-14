const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectMongo } = require('./src/utils/db');
const { seedInitialData } = require('./src/utils/seed');
const productsRoutes = require('./src/routes/products');
const authRoutes = require('./src/routes/auth');
const adminProductsRoutes = require('./src/routes/adminProducts');
const ordersRoutes = require('./src/routes/orders');
const { requireAuth, requireRole } = require('./src/middlewares/auth');
const { initGridFS } = require('./src/utils/gridfs');
const adminOrdersRoutes = require("./src/routes/adminOrders");

async function start() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '3mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => res.json({ ok: true, name: 'ADELINE STORE API', version: 'new-store-v1' }));


  const { MONGO_URI, PORT } = process.env;
  if (!MONGO_URI) throw new Error('Falta MONGO_URI en .env');
  await connectMongo(MONGO_URI);
  initGridFS();
  await seedInitialData();

  app.use('/api/products', productsRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/orders', ordersRoutes);
  
  app.use('/api/admin/products', requireAuth, requireRole('admin'), adminProductsRoutes);
  app.use("/api/admin/orders", requireAuth, requireRole("admin"), adminOrdersRoutes);

  app.use('/api', (req, res) => res.status(404).json({ ok: false, error: 'Ruta API no encontrada' }));

  const port = Number(PORT || 4000);
  app.listen(port, () => console.log(`[server] ADELINE escuchando en :${port}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
