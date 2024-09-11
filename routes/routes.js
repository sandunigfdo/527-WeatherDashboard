const express = require('express');
const router = express.Router();
const axios = require('axios');

// 会话中间件检查登录状态
function checkLogin(req, res, next) {
    if (req.session.loggedIn) {
        next(); // 如果已登录，继续处理请求
    } else {
        res.redirect('/login'); // 如果未登录，重定向到登录页面
    }
}


router.get('/', (req, res) => {
    res.render('home', {
        title: 'Home Page'
    });
});


router.get('/login', (req, res) => {
    res.render('Login');
});

router.get('/register', (req, res) => {
    res.render('Register');
});

router.get('/confirm', (req, res) => {
    res.render('confirm');
});

router.get('/customise', (req, res) => {
    res.render('customise');
});


// 主页路由，获取目前位置天气数据并渲染页面
router.get('/current', async (req, res) => {
    try {
        // First, fetch the latitude and longitude from Geoapify
        const geoApiKey = process.env.API_KEY;
        const cityName = "Hamilton";
        const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cityName)}&filter=countrycode:nz&apiKey=${geoApiKey}`;

        const geoResponse = await axios.get(geoUrl);
        const geoData = geoResponse.data;

        if (!geoData || !geoData.features || !geoData.features.length) {
            throw new Error('No geolocation found for the specified city');
        }

        const latitude = geoData.features[0].properties.lat;
        const longitude = geoData.features[0].properties.lon;

        // Then, use these coordinates to fetch weather data from Open-Meteo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m&timezone=Pacific%2FAuckland`;

        const weatherResponse = await axios.get(weatherUrl);
        const weatherData = weatherResponse.data;

        const temperature = weatherData.current.temperature_2m;
        const humidity = weatherData.current.relative_humidity_2m;
        const rain = weatherData.current.rain;
        const windSpeed = weatherData.current.wind_speed_10m;

        res.render('current', {
            temperature: `${temperature}°C`,
            humidity: `${humidity}%`,
            rain: `${rain} mm`,
            windSpeed: `${windSpeed} km/h`
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.render('current', {
            error: 'Unable to load weather data'
        });
    }
});


router.get('/map', (req, res) => {
    res.render('map', {
        title: 'Map'
    });
});


module.exports = router;