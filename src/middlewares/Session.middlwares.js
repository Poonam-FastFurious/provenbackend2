const session = require("express-session");

app.use(
  session({
    secret: "rahulsecrete", // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }, // Use secure cookies in production
  })
);
