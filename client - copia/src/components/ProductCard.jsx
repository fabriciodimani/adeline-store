import { Link } from "react-router-dom";
import { getProductMainImage } from "../utils/productImages.js";

const money = (n) => Number(n || 0).toLocaleString("es-AR");

export default function ProductCard({ product }) {
  const stock = (product.variants || []).reduce(
    (acc, v) => acc + Number(v.stock || 0),
    0
  );

  const img = getProductMainImage(product);

  return (
    <article className="product-card">
      <Link to={`/producto/${product._id}`} className="product-image-wrap">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <span className="heart">♡</span>

        <img
          src={img}
          alt={product.nombre}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/brand/adeline-logo-transparent.png";
          }}
        />
      </Link>

      <div className="product-info">
        <p className="product-name">{product.nombre}</p>
        <p className="product-price">ARS {money(product.precioVenta)}</p>

        <div className="swatches">
          {[...new Set((product.variants || []).map((v) => v.color))]
            .slice(0, 4)
            .map((c, i) => (
              <span key={c} className={`swatch swatch-${i}`} title={c} />
            ))}
        </div>

        <div className="sizes">
          {[...new Set((product.variants || []).map((v) => v.size))]
            .slice(0, 6)
            .map((s) => (
              <span key={s}>{s}</span>
            ))}
        </div>

        <p className={stock > 2 ? "stock ok" : stock > 0 ? "stock low" : "stock none"}>
          <span />
          {stock > 2
            ? "Stock disponible"
            : stock > 0
            ? "Últimas unidades"
            : "Sin stock"}
        </p>
      </div>
    </article>
  );
}