require("dotenv").config({ path: require('node:path').join(__dirname, '.env') });
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { isAllowedOrigin } = require('./config/cors');
const pool = require('./config/db');

const authRoutes = require("./routes/auth.routes");
const userReviewRoutes = require("./routes/userReview.routes");
const AddTreatment = require("./routes/treatments.routes");
const hospitalRoutes = require("./routes/hospitals.routes");
const doctorsRoutes = require("./routes/doctors.routes");
const specialitiesRoutes = require('./routes/specialities.routes');
const blogsRoutes = require('./routes/blogs.routes');
const citiesRouter = require('./routes/cities');
const adminWrites = require('./auth/admin.middleware');

const PORT = process.env.PORT || 4000;
const app = express();


// 1. CORS first
app.use(cors({
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
// 2. Security and parsing
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
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
app.use('/api/cities', adminWrites);
app.use('/api/admin/cities', adminWrites);
app.use('/api', citiesRouter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/hospitals", adminWrites, hospitalRoutes);
app.use("/api/doctors", adminWrites, doctorsRoutes);
app.use("/api/users/", adminWrites, userReviewRoutes);
app.use("/api/admin/", adminWrites, AddTreatment);
app.use('/api/specialities', adminWrites, specialitiesRoutes);
app.use('/api/blogs', adminWrites, blogsRoutes);
app.use('/api/care', require('./routes/care.routes').createCareRouter(require('./config/db')));
app.use('/api/lab', require('./routes/lab.routes').createLabRouter(pool));

// 5. Start
pool.query('SELECT 1').then(() => {
    app.listen(PORT, () => {
        console.log("Server running on http://localhost:" + PORT);
        console.log("Database ready");
    });
}).catch(async error => {
    console.error('Database connection failed. Check backend/.env and PostgreSQL:', error.code || error.message);
    await pool.end();
    process.exitCode = 1;
});
