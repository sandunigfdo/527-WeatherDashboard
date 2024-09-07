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

// 主页路由，获取天气数据并渲染页面
router.get('/', async (req, res) => {
    try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=-37.7898&longitude=175.319&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Pacific%2FAuckland';
        const response = await axios.get(url);
        console.log(response.data);
        const data = response.data;

        const temperature = data.current.temperature_2m;
        const humidity = data.current.relative_humidity_2m;
        const windSpeed = data.current.wind_speed_10m;

        res.render('home', {
            temperature: `${temperature}°C`,
            humidity: `${humidity}%`,
            windSpeed: `${windSpeed} km/h`
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.render('home', {
            error: 'Unable to load weather data'
        });
    }
});

// 登录页面路由
//login page routes
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login Page'
    });
});

// 处理登录表单提交
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 简单的用户名和密码检查（实际应用中应使用数据库和加密）
    if (username === 'admin' && password === 'password') {
        // 登录成功，重定向到首页
        res.redirect('/');
    } else {
        // 登录失败，返回登录页面并显示错误消息
        res.render('login', {
            title: 'Login Page',
            errorMessage: 'Invalid username or password',
            current: 'login'
        });
    }
});



router.get('/forecast', (req, res) => {
    res.render('forecast', {
        title: 'Forecast Page'
    });
});

router.get('/map', (req, res) => {
    res.render('map', {
        title: 'Map'
    });
});

module.exports = router;
