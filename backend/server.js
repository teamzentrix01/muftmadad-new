require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userReviewRoutes = require("./routes/userReview.routes");
const AddTreatment = require("./routes/treatments.routes");
const hospitalRoutes = require("./routes/hospitals.routes");
const doctorsRoutes = require("./routes/doctors.routes");
const specialitiesRoutes = require('./routes/specialities.routes');
const blogsRoutes = require('./routes/blogs.routes');
const citiesRouter = require('./routes/cities');

const PORT = process.env.PORT || 4000;
const app = express();


console.log(process.env.DATABASE_URL);
// 1. CORS first
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.options("/{\*path}", cors());

// 2. Security and parsing
app.use(helmet());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// 3. Rate limiting - only on actual auth (login/register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many requests, please try again later." }
});


// 4. Routes
app.use('/api', citiesRouter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/users/", userReviewRoutes);
app.use("/api/admin/", AddTreatment);
app.use('/api/specialities', specialitiesRoutes);
app.use('/api/blogs', blogsRoutes);

// 5. Start
app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
    console.log("Database ready");
});