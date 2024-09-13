const express = require('express');
const router = express.Router();
const { getGeoLocation, getWeather } = require('../public/js/weatherService');
const { fetchUserDetails } =require('../routes/users');

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
    if (!req.session.user || !req.session.user.token) {
        return res.status(401).send('User not authenticated');
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
            windSpeed: `${wind_speed_10m} km/h`
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