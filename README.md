# ADELINE-STORE

Proyecto nuevo para e-commerce de ropa ADELINE.

## Stack

- Node 22+
- Vite + React
- Express + MongoDB
- JWT para administración
- Carrito público sin login
- Stock por variante: talle/color/SKU
- Imágenes: URL externa o subida en Mongo/GridFS desde admin

## Estructura

```txt
ADELINE-STORE/
  client/
  server/
```

## 1) Backend

Crear `.env` dentro de `server` copiando `.env.example`:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/adeline_store
JWT_SECRET=adeline_store_super_secret_cambiar
JWT_EXPIRES=7d
```

Instalar y correr:

```powershell
cd C:\ADELINE-STORE\server
npm.cmd install
npm.cmd run start
```

Probar:

```txt
http://localhost:4000/api/health
```

Usuarios seed:

```txt
pia@adeline.com / Adeline123!
fabricio@adeline.com / Adeline123!
adri@adeline.com / Adeline123!
```

## 2) Frontend

```powershell
cd C:\ADELINE-STORE\client
npm.cmd install
npm.cmd run dev
```

Abrir:

```txt
http://localhost:5173
```

## Rutas

Públicas:

```txt
/
/producto/:id
/carrito
```

Admin:

```txt
/login
/admin/productos
```

## Próximas etapas sugeridas

1. Ajustar fotos reales de Pía y categorías reales.
2. Mejorar admin con importador CSV/Excel para cargar 200 prendas.
3. Agregar página de pedidos y confirmación de pagos.
4. Integrar Mercado Pago Checkout Pro.
5. Deploy: front en Vercel, back en Evennode o Render, Mongo Atlas.
