export const sendTelegramNotification = async (orderData) => {
  try {
    const response = await fetch('/api/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return null;
  }
};
