const axios = require('axios');

const sendWebhook = async (email, city) => {
    console.log('email', email);
    console.log('city', city);

    const notificationUrl = `${process.env.NOTIFICATION_BASE_URL}/user-created-webhook`;
    const headers = {
        'Authorization': process.env.NOTIFICATION_WEBHOOK_KEY
    };

    console.log(notificationUrl);

    const response = await axios.post(notificationUrl, {
        email,
        city
    }, {
        headers: headers
    });

    console.log(response.data)

    return {
        result: response.data.message
    };
};

module.exports = { sendWebhook };