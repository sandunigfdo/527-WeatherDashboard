const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

// 配置 AWS Cognito 参数
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: 'us-east-1' // 设置为你Cognito User Pool所在的区域
});

const USER_POOL_ID = 'us-east-1_XsePLogen'; // 替换为你的 User Pool ID
const CLIENT_ID = '23kan4e9bifq2eo29vkuec9iuc'; // 替换为你的 Client ID

// 注册新用户
router.post('/register', (req, res) => {
  const { email, password, customCity } = req.body;

  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: 'email',
        Value: email
      },
      {
        Name: 'custom:City',  // 自定义属性 customCity
        Value: customCity
      }
    ]
  };

  cognito.signUp(params, (err, data) => {
    if (err) {
      console.error('Error registering user:', err);
      return res.status(400).send(err.message || JSON.stringify(err));
    }
    res.json({
      message: 'User registered successfully!',
      data: data
    });
  });
});

// 确认用户注册
router.post('/confirm', (req, res) => {
  const { email, code } = req.body;

  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code
  };

  cognito.confirmSignUp(params, (err, data) => {
    if (err) {
      console.error('Error confirming user:', err);
      return res.status(400).send(err.message || JSON.stringify(err));
    }
    res.json({
      message: 'User confirmed successfully!',
      data: data
    });
  });
});

// 登录
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  };

  cognito.initiateAuth(params, (err, data) => {
    if (err) {
      console.error('Error logging in:', err);
      return res.status(400).send(err.message || JSON.stringify(err));
    }

    req.session.user = {
      email: email,
      token: data.AuthenticationResult.AccessToken
    };

    res.json({ redirectUrl: '/ship' });
  });
});

module.exports = router;  // 确保你正确地导出 router
