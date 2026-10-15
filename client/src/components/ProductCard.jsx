import { useState } from "react";
import { Link } from "react-router-dom";
import { getProductImages } from "../utils/productImages.js";
import { getOffer } from "../utils/offer.js";

const money = (n) => Number(n || 0).toLocaleString("es-AR");

export default function ProductCard({ product }) {
  const [hoverReady, setHoverReady] = useState(false);

  const stock = (product.variants || []).reduce(
    (acc, v) => acc + Number(v.stock || 0),
    0
  );

  const images = getProductImages(product);
  const mainImg = images[0];
  const hoverImg = images[1];
  const offer = getOffer(product);

  return (
    <article className="ad-product-card">
      <Link
        to={`/producto/${product._id}`}
        className="ad-product-img-wrap"
        onMouseEnter={() => setHoverReady(true)}
      >
        {stock <= 0 && <span className="ad-product-tag dark">SIN STOCK</span>}
        {offer.active && <span className="ad-offer-card-badge">{offer.percent}% OFF</span>}

        <img
          className="ad-product-img main"
          src={mainImg}
          alt={product.nombre}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = "/brand/adeline-logo-transparent.png";
          }}
        />

        {hoverImg && hoverReady && (
          <img
            className="ad-product-img hover"
            src={hoverImg}
            alt={product.nombre}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src =
                mainImg || "/brand/adeline-logo-transparent.png";
            }}
          />
        )}
      </Link>

      <div className="ad-product-info">
        <p className="ad-product-name">{product.nombre}</p>
        {offer.active && <s className="ad-offer-old-price">ARS {money(offer.previous)}</s>}
        <p className={offer.active ? "ad-product-price ad-offer-new-price" : "ad-product-price"}>
          ${money(product.precioVenta)}
        </p>
        {offer.active && offer.label !== `${offer.percent}% OFF` && <p className="ad-offer-note">{offer.label}</p>}
        {offer.active && offer.note && <p className="ad-offer-note">{offer.note}</p>}
        {offer.transfer > 0 && <p className="ad-offer-transfer">${money(offer.transfer)} con transferencia</p>}
      </div>
    </article>
  );
}