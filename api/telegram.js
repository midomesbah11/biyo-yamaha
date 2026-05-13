export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Fetch variables securely from backend environment
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram config missing: Bot Token or Chat ID is not defined.');
    return res.status(500).json({ error: 'Telegram configuration is missing' });
  }

  try {
    const orderData = req.body;
    
    // Format the message nicely using Markdown
    const message = `
🚨 *Nouvelle Commande Biyo Yamaha* 🚨

👤 *Client:* ${orderData.customer}
📞 *Téléphone:* ${orderData.phone}
📍 *Lieu:* ${orderData.wilaya}, ${orderData.commune}
🚚 *Livraison:* ${orderData.shippingType === 'domicile' ? 'À Domicile' : 'Stop Desk'}

🏍️ *Produit:* ${orderData.productName}
🔢 *Quantité:* ${orderData.quantity || 1}
💰 *Prix Produit:* ${orderData.productPrice} DA
📦 *Frais Livraison:* ${orderData.shippingCost} DA
💵 *Total à payer:* *${orderData.totalPrice} DA*
    `;

    const hasImage = orderData.productImage && orderData.productImage.startsWith('http');
    const telegramUrl = hasImage 
      ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`
      : `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const payload = {
      chat_id: TELEGRAM_CHAT_ID,
      parse_mode: 'Markdown',
    };

    if (hasImage) {
      payload.photo = orderData.productImage;
      payload.caption = message;
    } else {
      payload.text = message;
    }

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Telegram Error API:', result);
      return res.status(response.status).json({ error: result.description });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Telegram Unexpected Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
