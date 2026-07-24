const nodemailer = require("nodemailer");

const MAIL_TO = process.env.MAIL_TO || "adeline.store.ar@gmail.com";
const ADELINE_PHONE = process.env.ADELINE_PHONE || "381 473 1951";

function money(n) {
  return Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function createTransporter() {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn("[mailer] MAIL_USER o MAIL_PASS no configurados");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT || 465),
    secure: String(process.env.MAIL_SECURE || "true") === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

function buildOrderHtml(order) {
  const itemsHtml = (order.items || [])
    .map((item) => {
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">
            <b>${item.name || "Producto"}</b><br/>
            <small>Talle: ${item.size || "-"} | Color: ${item.color || "-"} | SKU: ${
        item.sku || "-"
      }</small>
          </td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">
            ${item.qty || 1}
          </td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">
            ARS ${money(item.price)}
          </td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">
            ARS ${money(Number(item.price || 0) * Number(item.qty || 1))}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5;">
      <h2>Nuevo pedido Adeline</h2>

      <p><b>Código:</b> ${order.code}</p>
      <p><b>Estado:</b> ${order.status}</p>
      <p><b>Medio de pago:</b> ${order.paymentMethod}</p>

      <hr/>

      <h3>Datos del cliente</h3>
      <p><b>Nombre:</b> ${order.customer?.nombre || "-"}</p>
      <p><b>Teléfono / WhatsApp:</b> ${order.customer?.telefono || "-"}</p>
      <p><b>Email:</b> ${order.customer?.email || "-"}</p>
      <p><b>Dirección / entrega:</b> ${order.customer?.direccion || "-"}</p>
      <p><b>Nota:</b> ${order.customer?.nota || "-"}</p>

      <hr/>

      <h3>Productos</h3>

      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #111;">Producto</th>
            <th style="text-align:center;padding:8px;border-bottom:2px solid #111;">Cant.</th>
            <th style="text-align:right;padding:8px;border-bottom:2px solid #111;">Precio</th>
            <th style="text-align:right;padding:8px;border-bottom:2px solid #111;">Subtotal</th>
          </tr>
        </thead>

        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <h2 style="text-align:right;margin-top:20px;">
        Total: ARS ${money(order.total)}
      </h2>

      <hr/>

      <p>
        Contacto Adeline:<br/>
        Email: ${MAIL_TO}<br/>
        WhatsApp Pía: ${ADELINE_PHONE}
      </p>
    </div>
  `;
}

async function sendOrderEmail(order) {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      return false;
    }

    await transporter.sendMail({
      from: `"Adeline Store" <${process.env.MAIL_USER}>`,
      to: MAIL_TO,
      subject: `Nuevo pedido ${order.code} - Adeline`,
      html: buildOrderHtml(order),
    });

    console.log(`[mailer] email enviado pedido ${order.code}`);
    return true;
  } catch (err) {
    console.error("[mailer] error enviando email:", err.message);
    return false;
  }
}

module.exports = {
  sendOrderEmail,
};