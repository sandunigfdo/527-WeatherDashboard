const express = require("express");
const router = express.Router();
const AWS = require("aws-sdk");
const crypto = require("crypto");
const { sendWebhook } = require("../modules/notificationService");

// Setting up AWS SDK
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: "us-east-1",
});

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Generating SecretHash
function generateSecretHash(username, clientId, clientSecret) {
  return crypto
    .createHmac("SHA256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

// Registering a new user
router.post("/register", (req, res) => {
  const { email, password, city } = req.body;

  const secretHash = generateSecretHash(email, CLIENT_ID, CLIENT_SECRET);

  const params = {
    ClientId: CLIENT_ID,
    SecretHash: secretHash,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
      {
        Name: "custom:City",
        Value: city,
      },
      {
        Name: "custom:isSubscribed",
        Value: '1',
      },
    ],
  };

  cognito.signUp(params, async (err, data) => {
    if (err) {
      console.error("Error registering user:", err);
      return res.status(400).send(err.message || JSON.stringify(err));
    }

    const result = await sendWebhook(
      params.UserAttributes[0].Value,
      params.UserAttributes[1].Value
    );
    console.log(result);

    // 返回确认页面的 URL
    res.json({
      message: "User registered successfully!",
      redirectUrl: "/confirm", // 重定向到确认页面
    });
  });
});

// Confirming a new user
router.post("/confirm", (req, res) => {
  const { email, code } = req.body;

  const secretHash = generateSecretHash(email, CLIENT_ID, CLIENT_SECRET);

  const params = {
    ClientId: CLIENT_ID,
    SecretHash: secretHash,
    Username: email,
    ConfirmationCode: code,
  };

  cognito.confirmSignUp(params, (err, data) => {
    if (err) {
      console.error("Error confirming user:", err);
      return res.status(400).send(err.message || JSON.stringify(err));
    }
    res.json({
      message: "User confirmed successfully!",
      data: data,
    });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: generateSecretHash(email, CLIENT_ID, CLIENT_SECRET),
    },
  };

  cognito.initiateAuth(params, (err, data) => {
    if (err) {
      return res.status(400).send(err.message || JSON.stringify(err));
    }

    // 登录成功后，记录用户的 session 状态
    req.session.isLoggedIn = true; // 记录用户为已登录状态
    req.session.user = {
      email: email,
      token: data.AuthenticationResult.AccessToken, // 存储令牌，若需要
    };

    // 返回 JSON 响应，重定向到主页
    res.json({ redirectUrl: "/" });
  });
});

router.post("/customise", (req, res) => {
  const { city } = req.body;

  if (!req.session.user || !req.session.user.token) {
    return res.status(401).send("User not authenticated");
  }

  const params = {
    AccessToken: req.session.user.token,
    UserAttributes: [
      {
        Name: "custom:City",
        Value: city,
      },
      {
        Name: "custom:isSubscribed",
        Value: '1',
      },
    ],
  };

  cognito.updateUserAttributes(params, async (err, data) => {
    if (err) {
      console.error("Error updating user attributes:", err);
      return res.status(400).send(err.message || JSON.stringify(err));
    }
    const result = await sendWebhook(
      req.session.user.email,
      params.UserAttributes[0].Value
    );
    console.log(result);
    res.json({ message: "Profile updated successfully!" });
  });
});


// Reset password
router.post("/reset-password", (req, res) => {
  const { email, code, password } = req.body;

  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    Password: password,
    SecretHash: generateSecretHash(email, CLIENT_ID, CLIENT_SECRET),
  };

  cognito.confirmForgotPassword(params, (err, data) => {
    if (err) {
      return res.status(400).send(err.message || JSON.stringify(err));
    }
    res.json({
      message: "Password reset successfully!",
      data: data,
    });
  });
});


// Forgot password
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    SecretHash: generateSecretHash(email, CLIENT_ID, CLIENT_SECRET),
  };

  cognito.forgotPassword(params, (err, data) => {
    if (err) {
      return res.status(400).send(err.message || JSON.stringify(err));
    }

    res.json({
      message: "Password reset code sent successfully!",
      data: data,
    });
  });
});


// 获取用户信息
router.get("/get-user-info", (req, res) => {
  if (!req.session.user || !req.session.user.token) {
    return res.status(401).send("User not authenticated");
  }

  const params = {
    AccessToken: req.session.user.token,
  };

  cognito.getUser(params, function (err, data) {
    if (err) {
      console.error("Error getting user info:", err);
      return res.status(400).json({ error: err.message });
    }

    // 提取城市和订阅状态信息
    const cityAttribute = data.UserAttributes.find(
      (attr) => attr.Name === "custom:City"
    );

    res.json({
      city: cityAttribute ? cityAttribute.Value : "",
    });
  });
});


router.post('/delete-account', async (req, res) => {
  if (!req.session.user || !req.session.user.token) {
    console.log('User session or token not found');
    return res.status(401).send("User not authenticated");
  }

  const params = {
    AccessToken: req.session.user.token,
  };

  try {
    console.log('Deleting user with token:', req.session.user.token);
    await cognito.deleteUser(params).promise();

    // 销毁会话，避免重复发送响应
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Failed to destroy session' });
      }
      // 确保只发送一次响应
      return res.status(200).json({ message: 'User account deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return res.status(500).json({ error: 'Failed to delete user account' });
  }
});


// 登出
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/");

  });
});

module.exports = router; // 确保正确导出 router


// 添加一个可重用的函数来获取用户信息
function fetchUserDetails(sessionToken) {
  return new Promise((resolve, reject) => {
    const params = { AccessToken: sessionToken };

    cognito.getUser(params, (err, data) => {
      if (err) {
        console.error("Error getting user info:", err);
        reject(err);
      } else {
        const cityAttribute = data.UserAttributes.find(
          (attr) => attr.Name === "custom:City"
        );
        resolve({
          city: cityAttribute ? cityAttribute.Value : "",

        });
      }
    });
  });
}

module.exports.fetchUserDetails = fetchUserDetails;