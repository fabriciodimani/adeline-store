import { Link, useLocation } from "react-router-dom";

export default function OrderConfirmed() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <main className="checkout-page">
      <section className="container order-confirmed">
        <p className="cart-eyebrow">ADELINE</p>
        <h1>Pedido confirmado</h1>

        <p>
          Recibimos tu pedido correctamente. En breve nos pondremos en contacto
          para coordinar el pago y la entrega.
        </p>

        {order?._id && (
          <div className="order-code">
            Código de pedido: <b>{order._id}</b>
          </div>
        )}

        <Link to="/" className="cart-black-btn">
          Volver a la tienda →
        </Link>
      </section>
    </main>
  );
}