require('dotenv').config()

//express framework
const express = require("express");
const handlebars = require("express-handlebars");
const app = express();

// Listen port will be loaded from .env file, or use 3000 if
const port = process.env.PORT || 3000;

// Setup Handlebars
app.engine("handlebars", handlebars.create({
    defaultLayout: "main"
}).engine);
app.set("view engine", "handlebars");

// Setup Handlebars with custom helpers
const hbs = handlebars.create({
    defaultLayout: "main",
    helpers: {
        if_eq: function (a, b, opts) {
            if (a == b) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        },
        // Indent each level by 20 pixels
        calculateIndentation: function (level) {
            return level * 20;
        },
        // Compare two values for equality
        eq: function (a, b) {
            return a === b;
        },
        // Check if at least one argument is true
        or: function (a, b) {
            return a || b;
        },
        // Additional helper functions can be added as needed
    }
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");


// Set up to read POSTed form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json({}));

// Set up cookie-parser middleware for parsing cookies
// 设置 cookie-parser 中间件，用于解析 cookie
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Set up express-session middleware for session management
// 设置 express-session 中间件，用于处理会话（session）管理
const session = require("express-session");
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || "default_secret" // Use environment variable for secret
}));

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false; // 判断用户是否已登录
    res.locals.user = req.session.user || null; // 用户信息
    next();
});

// Set the "public" folder as a static file directory, making its contents directly accessible
// 将 "public" 文件夹设置为静态文件目录，使其内容可以直接被访问
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Set up application routing
// 设置应用程序路由

const appRouter = require("./routes/routes.js");
app.use(appRouter);

const userRouter = require("./routes/users.js");
app.use(userRouter);


app.listen(port, function () {
    console.log(`Web-distinct-project listening on http://localhost:${port}/`);
});