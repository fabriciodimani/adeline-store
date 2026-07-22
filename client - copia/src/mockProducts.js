export const mockProducts = [
  {
    _id: 'mock-jean-light', codigo: 'AD-0001', nombre: 'Jean Wide Leg Light', tipo: 'Jeans',
    descripcion: 'Jean wide leg de tiro alto con fit relajado y caída amplia. Confeccionado en denim rígido premium.',
    precioCompra: 42000, precioVenta: 81900, badge: 'NUEVO',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1100&q=80',
      'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=900&q=80'
    ],
    variants: [
      { size: 'XS', color: 'Celeste Claro', sku: 'AD-0001-XS-CELESTE', stock: 2 },
      { size: 'S', color: 'Celeste Claro', sku: 'AD-0001-S-CELESTE', stock: 5 },
      { size: 'M', color: 'Azul', sku: 'AD-0001-M-AZUL', stock: 4 }
    ]
  },
  {
    _id: 'mock-top-morley', codigo: 'AD-0002', nombre: 'Top Asimétrico Morley', tipo: 'Tops',
    descripcion: 'Top asimétrico de morley premium, calce moderno y textura suave.',
    precioCompra: 14500, precioVenta: 32500, badge: 'ÚLTIMAS UNIDADES',
    images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1100&q=80'],
    variants: [{ size: 'S', color: 'Negro', sku: 'AD-0002-S-NEGRO', stock: 1 }]
  },
  {
    _id: 'mock-remera', codigo: 'AD-0003', nombre: 'Remera Algodón Premium', tipo: 'Remeras',
    descripcion: 'Remera de algodón premium, básica elevada para uso diario.',
    precioCompra: 9800, precioVenta: 24900, badge: '',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=80'],
    variants: [
      { size: 'S', color: 'Blanco', sku: 'AD-0003-S-BLANCO', stock: 7 },
      { size: 'M', color: 'Negro', sku: 'AD-0003-M-NEGRO', stock: 4 }
    ]
  },
  {
    _id: 'mock-falda', codigo: 'AD-0004', nombre: 'Falda Satinada Midi', tipo: 'Faldas',
    descripcion: 'Falda satinada con caída fluida y estilo elegante.',
    precioCompra: 22000, precioVenta: 49900, badge: 'POCAS UNIDADES',
    images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1100&q=80'],
    variants: [{ size: 'M', color: 'Negro', sku: 'AD-0004-M-NEGRO', stock: 2 }]
  },
  {
    _id: 'mock-conjunto', codigo: 'AD-0005', nombre: 'Conjunto Lino Natural', tipo: 'Conjuntos',
    descripcion: 'Conjunto de lino natural, ideal para looks sofisticados.',
    precioCompra: 46000, precioVenta: 89900, badge: 'NUEVO',
    images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=80'],
    variants: [{ size: 'S', color: 'Natural', sku: 'AD-0005-S-NATURAL', stock: 6 }]
  },
  {
    _id: 'mock-vestido', codigo: 'AD-0006', nombre: 'Vestido Satén Minimal', tipo: 'Vestidos',
    descripcion: 'Vestido satén minimalista, elegante y atemporal.',
    precioCompra: 38000, precioVenta: 78900, badge: 'NUEVO',
    images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1100&q=80'],
    variants: [{ size: 'M', color: 'Champagne', sku: 'AD-0006-M-CHAMPAGNE', stock: 3 }]
  }
];
