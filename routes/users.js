const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const crypto = require('crypto');


// 配置 AWS Cognito 参数
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: 'us-east-1' // 设置为你Cognito User Pool所在的区域
});

const USER_POOL_ID = 'us-east-1_XsePLogen'; // 替换为你的 User Pool ID
const CLIENT_ID = '23kan4e9bifq2eo29vkuec9iuc'; // 替换为你的 Client ID
const CLIENT_SECRET = process.env.CLIENT_SECRET; // 从环境变量获取 client_secret


// 生成 SecretHash
function generateSecretHash(username, clientId, clientSecret) {
  return crypto
      .createHmac('SHA256', clientSecret)
      .update(username + clientId)
      .digest('base64');
}


// 注册新用户
router.post('/register', (req, res) => {
  const {email, password, city} = req.body;
  const subscribe = req.body.subscribe ? 1 : 0;

  const secretHash = generateSecretHash(email, CLIENT_ID, CLIENT_SECRET);

  const params = {
    ClientId: CLIENT_ID,
    SecretHash: secretHash,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: 'email',
        Value: email
      },
      {
        Name: 'custom:City',
        Value: city
      },
      {
        Name: 'custom:isSubscribed',
        Value: subscribe.toString()
      }
    ]
  };

  cognito.signUp(params, (err, data) => {
    if (err) {
      console.error('Error registering user:', err);
      return res.status(400).send(err.message || JSON.stringify(err));
    }

    // 返回确认页面的 URL
    res.json({
      message: 'User registered successfully!',
      redirectUrl: '/confirm'  // 重定向到确认页面
    });
  });
});


// 确认用户注册
router.post('/confirm', (req, res) => {
  const {email, code} = req.body;

  const secretHash = generateSecretHash(email, CLIENT_ID, CLIENT_SECRET);

  const params = {
    ClientId: CLIENT_ID,
    SecretHash: secretHash, // 添加 SecretHash
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


router.post('/login', (req, res) => {
  const {email, password} = req.body;

  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: generateSecretHash(email, CLIENT_ID, CLIENT_SECRET)
    }
  };

  cognito.initiateAuth(params, (err, data) => {
    if (err) {
      return res.status(400).send(err.message || JSON.stringify(err));
    }

    // 登录成功后，记录用户的 session 状态
    req.session.isLoggedIn = true; // 记录用户为已登录状态
    req.session.user = {
      email: email,
      token: data.AuthenticationResult.AccessToken // 存储令牌，若需要
    };

    // 返回 JSON 响应，重定向到主页
    res.json({redirectUrl: '/'});
  });
});


router.post('/customise', (req, res) => {
  const {city, subscribe} = req.body;

  if (!req.session.user || !req.session.user.token) {
    return res.status(401).send('User not authenticated');
  }

  const params = {
    AccessToken: req.session.user.token,
    UserAttributes: [
      {
        Name: 'custom:City',
        Value: city
      },
      {
        Name: 'custom:isSubscribed',
        Value: subscribe.toString()
      }
    ]
  };

  cognito.updateUserAttributes(params, (err, data) => {
    if (err) {
      console.error('Error updating user attributes:', err);
      return res.status(400).send(err.message || JSON.stringify(err));
    }
    res.json({message: 'Profile updated successfully!'});
  });
});


// 获取用户信息
router.get('/get-user-info', (req, res) => {
  if (!req.session.user || !req.session.user.token) {
    return res.status(401).send('User not authenticated');
  }

  const params = {
    AccessToken: req.session.user.token
  };

  cognito.getUser(params, function (err, data) {
    if (err) {
      console.error('Error getting user info:', err);
      return res.status(400).json({error: err.message});
    }

    // 提取城市和订阅状态信息
    const cityAttribute = data.UserAttributes.find(attr => attr.Name === 'custom:City');
    const subscribeAttribute = data.UserAttributes.find(attr => attr.Name === 'custom:isSubscribed');

    res.json({
      city: cityAttribute ? cityAttribute.Value : '',
      isSubscribed: subscribeAttribute ? subscribeAttribute.Value === '1' : false
    });
  });
});


// 登出
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/'); // 重定向到登录页面
  });
});

module.exports = router;  // 确保正确导出 router


// 添加一个可重用的函数来获取用户信息
function fetchUserDetails(sessionToken) {
  return new Promise((resolve, reject) => {
    const params = {AccessToken: sessionToken};

    cognito.getUser(params, (err, data) => {
      if (err) {
        console.error('Error getting user info:', err);
        reject(err);
      } else {
        const cityAttribute = data.UserAttributes.find(attr => attr.Name === 'custom:City');
        const subscribeAttribute = data.UserAttributes.find(attr => attr.Name === 'custom:isSubscribed');

        resolve({
          city: cityAttribute ? cityAttribute.Value : '',
          isSubscribed: subscribeAttribute ? subscribeAttribute.Value === '1' : false
        });
      }
    });
  });
}

module.exports.fetchUserDetails = fetchUserDetails;