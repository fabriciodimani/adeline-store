export default function AdelineFooter() {
  return (
    <footer className="adeline-footer-modern" id="contacto">
      <div>
        <h3>NAVEGACIÓN</h3>
        <a href="/">Nuevo</a>
        <a href="/tienda">Ropa</a>
        <a href="/tienda">Denim</a>
        <a href="/tienda">Vestidos</a>
        <a href="/tienda">Sale</a>
      </div>

      <div>
        <h3>AYUDA</h3>
        <a href="/">Preguntas frecuentes</a>
        <a href="/">Guía de talles</a>
        <a href="/">Envíos</a>
        <a href="/">Cambios y devoluciones</a>
      </div>

      <div>
        <h3>CONTACTO</h3>
        <p>WhatsApp: 381 473 1951</p>
        <p>adeline.store.ar@gmail.com</p>
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
  );
}