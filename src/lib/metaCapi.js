export const sendMetaEvent = async (eventName, userData = {}, customData = {}) => {
  try {
    const response = await fetch('/api/meta-capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventID: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventSourceUrl: window.location.href,
        testEventCode: 'TEST24110',
        userData,
        customData
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending Meta CAPI event from frontend:', error);
    return null;
  }
};
