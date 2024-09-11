const axios = require('axios');

const getGeoLocation = async (cityName) => {
    const geoApiKey = process.env.API_KEY;
    const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cityName)}&filter=countrycode:nz&apiKey=${geoApiKey}`;

    const response = await axios.get(geoUrl);
    const geoData = response.data;

    if (!geoData || !geoData.features || !geoData.features.length) {
        throw new Error('No geolocation found for the specified city');
    }

    return {
        latitude: geoData.features[0].properties.lat,
        longitude: geoData.features[0].properties.lon
    };
};

const getWeather = async (latitude, longitude) => {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m&timezone=Pacific%2FAuckland`;
    const response = await axios.get(weatherUrl);
    return response.data.current;
};

module.exports = { getGeoLocation, getWeather };