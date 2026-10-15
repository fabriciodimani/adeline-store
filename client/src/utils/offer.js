// La liquidación solo se aplica a productos explícitamente habilitados.
export function getOffer(product) {
  const price = Number(product?.precioVenta || 0);
  const previous = Number(product?.precioAnterior || 0);
  const active = product?.enOferta === true && price > 0 && previous > price;
  const transfer = Number(product?.precioTransferencia || 0);
  return {
    active,
    price,
    previous,
    percent: active ? Math.round((1 - price / previous) * 100) : 0,
    label: active ? (String(product?.textoOferta || "").trim() || `${Math.round((1 - price / previous) * 100)}% OFF`) : "",
    note: active ? String(product?.textoExtraOferta || "").trim() : "",
    transfer: active && transfer > 0 && transfer < price ? transfer : 0,
  };
}

// Precio normal del carrito; el precio de transferencia se aplica en Checkout.
export function getCartOffer(item) {
  return getOffer(item);
}

export function getPriceForPayment(item, paymentMethod) {
  const offer = getCartOffer(item);
  return paymentMethod === "TRANSFERENCIA" && offer.transfer > 0
    ? offer.transfer
    : Number(item?.precioVenta ?? item?.price ?? 0);
}
