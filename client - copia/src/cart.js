const KEY = 'adeline_cart';

export function getCart() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function setCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items || []));
  window.dispatchEvent(new Event('adeline-cart'));
}

export function addToCart(item) {
  const cart = getCart();
  const key = `${item.productId}-${item.sku}`;
  const idx = cart.findIndex(x => `${x.productId}-${x.sku}` === key);
  if (idx >= 0) cart[idx].qty += item.qty;
  else cart.push(item);
  setCart(cart);
}

export function cartCount() {
  return getCart().reduce((acc, it) => acc + Number(it.qty || 0), 0);
}
