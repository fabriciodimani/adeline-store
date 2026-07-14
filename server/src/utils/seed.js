const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const User = require('../models/User');

async function seedInitialData() {
  const users = await User.countDocuments();
  if (users === 0) {
    await User.create([
      { nombre: 'Fabricio', email: 'fabricio@adeline.com', passwordHash: bcrypt.hashSync('Adeline123!', 10), role: 'admin' },
      { nombre: 'Pía', email: 'pia@adeline.com', passwordHash: bcrypt.hashSync('Adeline123!', 10), role: 'admin' },
      { nombre: 'Adri', email: 'adri@adeline.com', passwordHash: bcrypt.hashSync('Adeline123!', 10), role: 'admin' }
    ]);
    console.log('[seed] usuarios admin creados');
  }

  const products = await Product.countDocuments();
  if (products > 0) return;

  await Product.create([
    {
      codigo: 'AD-0001', nombre: 'Jean Wide Leg Light', tipo: 'Jeans',
      descripcion: 'Jean wide leg de tiro alto con fit relajado y caída amplia. Denim rígido premium.',
      precioCompra: 42000, precioVenta: 81900, badge: 'NUEVO',
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1100&q=80'],
      variants: [
        { size: 'XS', color: 'Celeste Claro', sku: 'AD-0001-XS-CELESTE', stock: 2 },
        { size: 'S', color: 'Celeste Claro', sku: 'AD-0001-S-CELESTE', stock: 5 },
        { size: 'M', color: 'Azul', sku: 'AD-0001-M-AZUL', stock: 4 }
      ]
    },
    {
      codigo: 'AD-0002', nombre: 'Top Asimétrico Morley', tipo: 'Tops',
      descripcion: 'Top asimétrico de morley premium, calce moderno y textura suave.',
      precioCompra: 14500, precioVenta: 32500, badge: 'ÚLTIMAS UNIDADES',
      images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1100&q=80'],
      variants: [{ size: 'S', color: 'Negro', sku: 'AD-0002-S-NEGRO', stock: 1 }]
    },
    {
      codigo: 'AD-0003', nombre: 'Remera Algodón Premium', tipo: 'Remeras',
      descripcion: 'Remera de algodón premium, básica elevada para uso diario.',
      precioCompra: 9800, precioVenta: 24900, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=80'],
      variants: [
        { size: 'S', color: 'Blanco', sku: 'AD-0003-S-BLANCO', stock: 7 },
        { size: 'M', color: 'Negro', sku: 'AD-0003-M-NEGRO', stock: 4 }
      ]
    }
  ]);
  console.log('[seed] productos demo creados');
}

module.exports = { seedInitialData };
