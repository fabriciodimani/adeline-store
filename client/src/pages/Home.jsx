import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api.js";
import { mockProducts } from "../mockProducts.js";
import ProductCard from "../components/ProductCard.jsx";

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
  // { title: "ACCESORIOS", image: editorialImages.accessories },
];

function hasProductImage(product) {
  const hasImageIds = Array.isArray(product?.imageIds) && product.imageIds.length > 0;
  const hasImages = Array.isArray(product?.images) && product.images.length > 0;
  return Boolean(hasImageIds || hasImages || product?.imageId || product?.image || product?.imageUrl);
}

function pickProducts(products, count = 6) {
  const source = Array.isArray(products) && products.length ? products : mockProducts;

  // Importante: la home no debe mostrar productos sin foto,
  // porque terminan usando el logo como fallback y arruinan el diseño.
  const withImages = source.filter(hasProductImage);

  if (withImages.length) return withImages.slice(0, count);

  // Fallback solo para desarrollo si la API no trae nada.
  return mockProducts.filter(hasProductImage).slice(0, count);
}

export default function Home() {
  const [products, setProducts] = useState(mockProducts);

  useEffect(() => {
    apiGet("/api/products")
      .then((data) => {
        const list = Array.isArray(data?.items) ? data.items : data;
        if (Array.isArray(list) && list.length) setProducts(list);
      })
      .catch(() => setProducts(mockProducts));
  }, []);

  const newIn = useMemo(() => pickProducts(products, 6), [products]);
  const instagram = useMemo(() => pickProducts(products, 5), [products]);

  return (
    <main className="adeline-home-modern">
      <section className="adeline-hero-editorial" id="inicio">
        <div className="adeline-hero-image" style={{ backgroundImage: `url(${editorialImages.hero})` }} />

        <div className="adeline-hero-panel">
          <p>NUEVA COLECCIÓN</p>
          <h1>Street Style</h1>
          <span>Looks que te acompañan de día y de noche.</span>

          <div className="adeline-hero-actions">
            <a href="#tienda" className="adeline-btn-light">
              COMPRAR AHORA
            </a>
          </div>
        </div>
      </section>

      <section className="adeline-collection-grid" id="coleccion">
        {collectionTiles.map((item) => (
          <a href="#tienda" className="adeline-collection-tile" key={item.title}>
            <img src={item.image} alt={item.title} loading="lazy" />
            <div>
              <h2>{item.title}</h2>
              <span>Ver más →</span>
            </div>
          </a>
        ))}
      </section>

      <section className="adeline-new-in" id="tienda">
        <div className="adeline-section-title">
          <span />
          <h2>New In</h2>
          <a href="#tienda">VER TODO</a>
        </div>

        <div className="adeline-products-row">
          {newIn.map((product) => (
            <ProductCard key={product._id || product.codigo} product={product} compact />
          ))}
        </div>

        <div className="adeline-center-action">
          <a href="#tienda">VER TODOS LOS PRODUCTOS</a>
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

      {/* <section className="adeline-instagram-section">
        <h2>@ADELINE.OFICIAL</h2>
        <div className="adeline-instagram-grid">
          {instagram.map((product) => (
            <ProductCard key={product._id || product.codigo} product={product} imageOnly />
          ))}
        </div>
        <a className="adeline-instagram-btn" href="#inicio">
          VER MÁS EN INSTAGRAM
        </a>
      </section> */}

      <section className="adeline-club-section">
        <div className="adeline-club-photo" style={{ backgroundImage: `url(${editorialImages.club})` }} />
        <div className="adeline-club-copy">
          <span>SUSCRIBITE A</span>
          <h2>Adeline Club</h2>
          <p>Se la primera en enterarte de nuevos ingresos, reposiciones y lanzamientos exclusivos.</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Tu correo electrónico" />
            <button type="submit">SUSCRIBIRME</button>
          </form>
        </div>
      </section>

      <footer className="adeline-footer-modern" id="contacto">
        <div>
          <h3>NAVEGACIÓN</h3>
          <a href="#inicio">Nuevo</a>
          <a href="#tienda">Ropa</a>
          <a href="#coleccion">Denim</a>
          <a href="#coleccion">Vestidos</a>
          <a href="#tienda">Sale</a>
        </div>
        <div>
          <h3>AYUDA</h3>
          <a href="#inicio">Preguntas frecuentes</a>
          <a href="#inicio">Guía de talles</a>
          <a href="#inicio">Envíos</a>
          <a href="#inicio">Cambios y devoluciones</a>
        </div>
        <div>
          <h3>CONTACTO</h3>
          <p>WhatsApp: 381 473 1951</p>
          <p>adeline.store.ar@gmail.com</p>
          {/* <p>Lunes a Viernes de 9 a 18 hs.</p> */}
        </div>
        <div>
          <h3>SEGUINOS</h3>

          <div className="adeline-social-icons">
            <a
              href="https://www.instagram.com/adelinestore__/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram Adeline"
              title="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm4.2 3.3A4.7 4.7 0 1 1 12 16.7a4.7 4.7 0 0 1 0-9.4Zm0 2A2.7 2.7 0 1 0 12 14.7a2.7 2.7 0 0 0 0-5.4Zm5-2.15a1.1 1.1 0 1 1 0 2.2a1.1 1.1 0 0 1 0-2.2Z" />
              </svg>
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61585783258022"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook Adeline"
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 8.5V6.7c0-.8.3-1.2 1.3-1.2H17V2.3C16.2 2.2 15.3 2 14.2 2C11.5 2 10 3.6 10 6.4v2.1H7v3.6h3V22h4v-9.9h3.1l.5-3.6H14Z" />
              </svg>
            </a>
          </div>

        <div className="adeline-social-links-text">
          <a
            href="https://www.instagram.com/adelinestore__/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram: @adelinestore__
          </a>

          <a
            href="https://www.facebook.com/profile.php?id=61585783258022"
            target="_blank"
            rel="noreferrer"
          >
            Facebook: Adeline Store
          </a>
</div>

        </div>
        <div className="adeline-footer-brand">
          <img src="/brand/adeline-logo-transparent.png" alt="Adeline" />
          <p>Vestirse nunca fue tan fácil.</p>
        </div>
        <div className="adeline-payment-row">
          <span>Medios de pago</span>
          <b>VISA</b>
          <b>Mastercard</b>
          <b>Amex</b>
          <b>Naranja X</b>
          <b>Mercado Pago</b>
        </div>
      </footer>
    </main>
  );
}
