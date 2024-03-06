const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");

const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");

const rateLimit = require('express-rate-limit')
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 60, // Limite a 60 demandes par fenetre, ici 1 minute
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15minutes
    limit: 5, //Limite a 5 demandes par fenetre, ici 15 minutes
    message: "Vous avez atteint les 5 demandes par 15 minutes pour le login",
});

mongoose
    .connect("mongodb+srv://JohnDoe:BR6yJ9u9yOkhlG9k@clustermonvieuxgrimoire.ianugsg.mongodb.net/?retryWrites=true&w=majority&appName=ClusterMonVieuxGrimoire", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});
app.use(
    mongoSanitize({
        replaceWith: "_",
    })
);
app.use(
    helmet({
        contentSecurityPolicy: false,
        xDownloadOptions: false,
    })
);
app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);
app.use("/api", limiter);
app.use("api/auth/login", loginLimiter);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
