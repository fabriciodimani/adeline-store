import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api.js";
import { mockProducts } from "../mockProducts.js";
import ProductCard from "../components/ProductCard.jsx";
import AdelineFooter from "../components/AdelineFooter.jsx";

const editorialImages = {
  hero: "/brand/hero.jpeg",
  best: "/brand/best-sellers.jpeg",
  denim: "/brand/denim-pants.jpg",
  street: "/brand/everyday-looks.jpeg",
  winter: "/brand/night-out.jpeg",
  club: "/brand/club.jpeg",
};

const collectionTiles = [
  { title: "BEST SELLERS", image: editorialImages.best },
  { title: "EVERYDAY LOOKS", image: editorialImages.street },
  { title: "DENIM & PANTS", image: editorialImages.denim },
  { title: "NIGHT\nOUT", image: editorialImages.winter },
];

function hasProductImage(product) {
  const hasImageIds =
    Array.isArray(product?.imageIds) && product.imageIds.length > 0;

  const hasImages =
    Array.isArray(product?.images) && product.images.length > 0;

  return Boolean(
    hasImageIds ||
      hasImages ||
      product?.imageId ||
      product?.image ||
      product?.imageUrl
  );
}

function pickProducts(products, count = 6) {
  const source =
    Array.isArray(products) && products.length ? products : mockProducts;

  const withImages = source.filter(hasProductImage);

  if (withImages.length) return withImages.slice(0, count);

  return mockProducts.filter(hasProductImage).slice(0, count);
}

export default function Home() {
  const [products, setProducts] = useState(mockProducts);

  useEffect(() => {
    apiGet("/api/products")
      .then((data) => {
        const list = Array.isArray(data?.items) ? data.items : data;

        if (Array.isArray(list) && list.length) {
          setProducts(list);
        }
      })
      .catch(() => setProducts(mockProducts));
  }, []);

  const newIn = useMemo(() => pickProducts(products, 6), [products]);

  return (
    <>
      <main className="adeline-home-modern">
        <section className="adeline-hero-editorial" id="inicio">
          <div
            className="adeline-hero-image"
            style={{ backgroundImage: `url(${editorialImages.hero})` }}
          />

          <div className="adeline-hero-panel">
            <p>NUEVA COLECCIÓN</p>
            <h1>Street Style</h1>
            <span>Looks que te acompañan de día y de noche.</span>

            <div className="adeline-hero-actions">
              <Link to="/tienda" className="adeline-btn-light">
                COMPRAR AHORA
              </Link>
            </div>
          </div>
        </section>

        <section className="adeline-collection-grid" id="coleccion">
          {collectionTiles.map((item) => (
            <Link
              to="/tienda"
              className="adeline-collection-tile"
              key={item.title}
            >
              <img src={item.image} alt={item.title} loading="lazy" />

              <div>
                <h2>{item.title}</h2>
                <span>Ver más →</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="adeline-new-in" id="tienda">
          <div className="adeline-section-title">
            <span />
            <h2>New In</h2>
            <Link to="/tienda">VER TODO</Link>
          </div>

          <div className="adeline-products-row">
            {newIn.map((product) => (
              <ProductCard
                key={product._id || product.codigo}
                product={product}
                compact
              />
            ))}
          </div>

          <div className="adeline-center-action">
            <Link to="/tienda">VER TODOS LOS PRODUCTOS</Link>
          </div>
        </section>

        <section className="adeline-benefits-modern">
          <article>
            <div>▱</div>
            <b>ENVÍOS A TODO EL PAÍS</b>
            <p>Envíos rápidos y seguros a donde estés.</p>
          </article>

          <article>
            <div>▭</div>
            <b>3 CUOTAS SIN INTERÉS</b>
            <p>En todas las compras con tarjetas seleccionadas.</p>
          </article>

          <article>
            <div>%</div>
            <b>10% OFF TRANSFERENCIA</b>
            <p>Aprovechá el descuento en tu compra.</p>
          </article>

          <article>
            <div>☏</div>
            <b>ATENCIÓN PERSONALIZADA</b>
            <p>Estamos para ayudarte por WhatsApp y email.</p>
          </article>
        </section>

        <section className="adeline-club-section">
          <div
            className="adeline-club-photo"
            style={{ backgroundImage: `url(${editorialImages.club})` }}
          />

          <div className="adeline-club-copy">
            <span>SUSCRIBITE A</span>
            <h2>Adeline Club</h2>
            <p>
              Se la primera en enterarte de nuevos ingresos, reposiciones y
              lanzamientos exclusivos.
            </p>

            <form onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Tu correo electrónico" />
              <button type="submit">SUSCRIBIRME</button>
            </form>
          </div>
        </section>
      </main>

      <AdelineFooter />
    </>
  );
}