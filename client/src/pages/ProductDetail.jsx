import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../api.js";
import { addToCart } from "../cart.js";
import { mockProducts } from "../mockProducts.js";
import ProductCard from "../components/ProductCard.jsx";
import { getProductImages } from "../utils/productImages.js";

const money = (n) => Number(n || 0).toLocaleString("es-AR");

function findVariant(product, size, color) {
  return (product?.variants || []).find((v) => v.size === size && v.color === color);
}



export default function ProductDetail() {

  
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  
  useEffect(() => {
    const fallback = mockProducts.find((p) => p._id === id) || mockProducts[0];

    apiGet(`/api/products/${id}`)
      .then((data) => setProduct(data.item || data))
      .catch(() => setProduct(fallback));
  }, [id]);

  useEffect(() => {
    const first = product?.variants?.[0];

    if (first) {
      setSize(first.size);
      setColor(first.color);
      setQty(1);
    }

    // ✅ clave: cuando cambia el producto/fotos, vuelve a la primera imagen
    setActiveImg(0);
  }, [product?._id, product?.imageIds?.join("|"), product?.images?.join("|")]);

  const images = useMemo(() => getProductImages(product), [product]);

  const sizes = useMemo(
    () => [...new Set((product?.variants || []).map((v) => v.size))],
    [product]
  );

  const colors = useMemo(
    () => [
      ...new Set(
        (product?.variants || [])
          .filter((v) => v.size === size)
          .map((v) => v.color)
      ),
    ],
    [product, size]
  );

  const variant = findVariant(product, size, color);
  const stock = Number(variant?.stock || 0);
  const canBuy = stock > 0 && qty <= stock;

  const handleAdd = () => {
    if (!canBuy) return;

    addToCart({
      productId: product._id,
      codigo: product.codigo,
      nombre: product.nombre,
      precioVenta: product.precioVenta,
      precioCompra: product.precioCompra,
      image: images[0],
      sku: variant.sku,
      size,
      color,
      qty,
      stock,
    });

    setMsg("Producto agregado al carrito");
    setTimeout(() => setMsg(""), 1800);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (!canBuy) return;
    handleAdd();
    navigate("/carrito");
  };

  if (!product) {
    return <main className="container loading-page">Cargando producto…</main>;
  }

  return (
    <main className="container detail-page">
      <div className="breadcrumb">
        <Link to="/">Inicio</Link> / Tienda / {product.tipo} / {product.nombre}
      </div>

      <section className="detail-layout">
        <aside className="thumbs">
          {images.map((img, i) => (
            <button
              key={img + i}
              className={i === activeImg ? "active" : ""}
              onClick={() => setActiveImg(i)}
              type="button"
            >
              <img
                src={img}
                alt="miniatura"
                onError={(e) => {
                  e.currentTarget.src = "/brand/adeline-logo-transparent.png";
                }}
              />
            </button>
          ))}
        </aside>

        <section className="main-photo">
          {product.badge && <span className="product-badge">{product.badge}</span>}
          <span className="heart big">♡</span>

          <img
            src={images[activeImg] || images[0]}
            alt={product.nombre}
            onError={(e) => {
              e.currentTarget.src = "/brand/adeline-logo-transparent.png";
            }}
          />
        </section>

        <section className="detail-info">
          <p className="type-label">{product.tipo}</p>

          <h1>{product.nombre}</h1>

          <h2>ARS {money(product.precioVenta)}</h2>

          <p className="installments">
            hasta 6 cuotas sin interés de ARS {money(product.precioVenta / 6)}
          </p>

          <p className="detail-desc">{product.descripcion}</p>

          <div className="divider" />

          <div className="selector-head">
            <b>TALLE</b>
            <a href="#talles">GUÍA DE TALLES</a>
          </div>

          <div className="option-row">
            {sizes.map((s) => (
              <button
                key={s}
                className={s === size ? "selected" : ""}
                onClick={() => {
                  setSize(s);
                  const c = (product.variants || []).find((v) => v.size === s)?.color || "";
                  setColor(c);
                  setQty(1);
                }}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>

          <p className="color-label">
            <b>COLOR:</b> {color || "-"}
          </p>

          <div className="option-row color-options">
            {colors.map((c, i) => (
              <button
                key={c}
                className={c === color ? "selected color" : "color"}
                onClick={() => setColor(c)}
                type="button"
              >
                <span className={`swatch swatch-${i}`} />
              </button>
            ))}
          </div>

          <p className={stock > 2 ? "stock ok" : stock > 0 ? "stock low" : "stock none"}>
            <span />
            {stock > 0 ? `${stock} disponible${stock === 1 ? "" : "s"}` : "Sin stock"}
          </p>

          <div className="purchase-row">
            <div className="qty-control">
              <button onClick={() => setQty(Math.max(1, qty - 1))} type="button">
                −
              </button>

              <b>{qty}</b>

              <button
                onClick={() => setQty(Math.min(stock, qty + 1))}
                type="button"
                disabled={stock <= 0 || qty >= stock}
              >
                +
              </button>
            </div>

            <button className="add-cart" disabled={!canBuy} onClick={handleAdd} type="button">
              ▣ AGREGAR AL CARRITO
            </button>
          </div>

          <Link className="buy-now" to="/carrito" onClick={handleBuyNow}>
            COMPRAR AHORA →
          </Link>

          {msg && <div className="success-msg">{msg}</div>}

          <div className="mini-trust">
            <div>
              <b>COMPRA SEGURA</b>
              <p>Datos protegidos.</p>
            </div>

            <div>
              <b>TARJETAS Y DÉBITO</b>
              <p>Checkout online.</p>
            </div>

            <div>
              <b>TRANSFERENCIA</b>
              <p>Confirmación rápida.</p>
            </div>
          </div>
        </section>
      </section>

      <section className="detail-tabs">
        <div>
          <b>DESCRIPCIÓN</b>
        </div>
        <div>GUÍA DE TALLES</div>
        <div>ENVÍOS Y CAMBIOS</div>
      </section>

      <section className="description-block">
        <p>
          Prenda premium seleccionada para una experiencia cómoda, elegante y duradera.
          Ideal para combinar con básicos o prendas de temporada.
        </p>

        <ul>
          <li>Calce moderno</li>
          <li>Stock controlado por talle y color</li>
          <li>Compra segura</li>
        </ul>
      </section>

      <h3 className="related-title">También te puede interesar</h3>

      <div className="related-grid">
        {mockProducts
          .filter((p) => p._id !== product._id)
          .slice(0, 4)
          .map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
      </div>
    </main>
  );
}