const express = require('express');
const router = express.Router();
const axios = require('axios');

// 登录页面路由
//login page routes
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login Page'
    });
});

// 处理登录表单提交
//
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 简单的用户名和密码检查（在实际项目中应使用数据库和加密）
    if (username === 'admin' && password === 'password') {
        // 登录成功，重定向到首页
        res.redirect('/');
    } else {
        // 登录失败，返回登录页面并显示错误消息
        res.render('login', {
            title: 'Login Page',
            errorMessage: 'Invalid username or password'
        });
    }
});


module.exports = router;
