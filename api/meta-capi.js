import crypto from 'crypto';

// Helper function to hash data using SHA256
const hashData = (data) => {
  if (!data) return undefined;
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Fetch variables securely from backend environment
  const PIXEL_ID = process.env.PIXEL_ID;
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.error('Meta CAPI Error: PIXEL_ID or ACCESS_TOKEN is missing.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const {
      eventName,
      eventID,
      eventSourceUrl,
      testEventCode,
      userData = {},
      customData = {},
    } = req.body;

    // 1. Extract and format user data
    const { email, phone, firstName, lastName, city } = userData;

    // Extract cookies and request headers for Event Match Quality
    const client_ip_address = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const client_user_agent = req.headers['user-agent'];
    const fbp = req.cookies?._fbp || userData.fbp;
    const fbc = req.cookies?._fbc || userData.fbc;

    // Prepare hashed user data payload
    const user_data = {
      client_ip_address,
      client_user_agent,
      fbp,
      fbc,
      em: hashData(email),
      ph: hashData(phone),
      fn: hashData(firstName),
      ln: hashData(lastName),
      ct: hashData(city),
    };

    // Remove undefined fields
    Object.keys(user_data).forEach((key) => user_data[key] === undefined && delete user_data[key]);

    // 2. Prepare Custom Data specifically for Biyo Yamaha (Motorcycle Store)
    const custom_data = {
      currency: 'DZD',
      value: customData.value || 0,
      content_name: customData.content_name,
      content_ids: customData.content_ids || [],
      content_type: 'product',
      // Dynamic fields for Biyo Yamaha
      content_category: customData.content_category, // e.g., Motorcycles, Spare Parts, Accessories
      model_year: customData.model_year,             // e.g., 2023, 2024
      engine_size: customData.engine_size,           // e.g., 530cc, 700cc
      ...customData
    };

    // 3. Construct Meta CAPI Payload
    const payload = {
      data: [
        {
          event_name: eventName || 'ViewContent',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id: eventID,
          event_source_url: eventSourceUrl || req.headers.referer,
          user_data,
          custom_data,
        },
      ],
      ...((testEventCode || process.env.TEST_EVENT_CODE) && { test_event_code: testEventCode || process.env.TEST_EVENT_CODE }),
    };

    // 4. Send request to Meta Conversions API
    const metaApiUrl = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    const response = await fetch(metaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Meta CAPI Error Response:', result);
      return res.status(response.status).json({ error: result.error });
    }

    console.log(`[Meta CAPI] Success: ${eventName} sent successfully`, result);
    return res.status(200).json({ success: true, result });

  } catch (error) {
    console.error('Meta CAPI Unexpected Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
