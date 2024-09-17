const express = require('express');
const router = express.Router();

const { getGeoLocation, getWeather } = require('../modules/weatherService');
const { fetchUserDetails } = require('../routes/users');
const axios = require('axios');

// 会话中间件检查登录状态
function checkLogin(req, res, next) {
    if (req.session.loggedIn) {
        next(); // 如果已登录，继续处理请求
    } else {
        res.redirect('/login'); // 如果未登录，重定向到登录页面
    }
}

// Serve static files - SSL verification files
router.use(express.static('ssl'));


router.get('/', (req, res) => {
    res.render('home', {
        title: 'Home Page'
    });
});


router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/confirm', (req, res) => {
    res.render('confirm');
});

router.get('/customise', (req, res) => {
    res.render('customise');
});

router.get('/reset-password', (req, res) => {
    const email = req.query.email || '';
    res.render('resetpw', { email });
});


// 主页路由，获取目前位置天气数据并渲染页面
router.get('/current', async (req, res) => {
    if (!req.session.user || !req.session.user.token) {
        return res.render('current', {
            authError: true
        });
    }
    try {
        const userDetails = await fetchUserDetails(req.session.user.token);
        const cityName = userDetails.city;
        const { latitude, longitude } = await getGeoLocation(cityName);
        const { temperature_2m, relative_humidity_2m, rain, wind_speed_10m } = await getWeather(latitude, longitude);

        res.render('current', {
            city: cityName,
            temperature: `${temperature_2m}°C`,
            humidity: `${relative_humidity_2m}%`,
            rain: `${rain} mm`,
            windSpeed: `${wind_speed_10m} km/h`,
            authError: false // No authentication error
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.render('current', {
            error: 'Unable to load weather data'
        });
    }
});

// 新增路由：获取7天天气预报
router.get('/forecast', async (req, res) => {
    try {
        console.log('Forecast route accessed');

        // Use the same geolocation logic as your current weather route
        const geoApiKey = process.env.API_KEY;
        const cityName = "Hamilton";
        const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cityName)}&filter=countrycode:nz&apiKey=${geoApiKey}`;

        const geoResponse = await axios.get(geoUrl);
        const geoData = geoResponse.data;

        if (!geoData.features || geoData.features.length === 0) {
            throw new Error('No location data found');
        }

        const latitude = geoData.features[0].properties.lat;
        const longitude = geoData.features[0].properties.lon;

        // Forecast API call
        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=Pacific%2FAuckland&forecast_days=7`;
        console.log('Fetching forecast from:', forecastUrl);

        const forecastResponse = await axios.get(forecastUrl);
        const forecastData = forecastResponse.data;

        console.log('Forecast data received:', JSON.stringify(forecastData, null, 2));

        if (!forecastData.daily) {
            throw new Error('Unexpected forecast data structure');
        }

        const forecast = forecastData.daily.time.map((date, index) => ({
            date: new Date(date).toLocaleDateString('en-NZ', { weekday: 'long', month: 'short', day: 'numeric' }),
            maxTemp: `${forecastData.daily.temperature_2m_max[index]}°C`,
            minTemp: `${forecastData.daily.temperature_2m_min[index]}°C`
        }));

        res.render('forecast', { forecast });
    } catch (error) {
        console.error('Error in forecast route:', error);
        res.status(500).render('forecast', { error: 'Unable to load forecast data' });
    }
});

router.get('/map', (req, res) => {
    res.render('map', {
        title: 'Map'
    });
});


module.exports = router;