import dotenv from 'dotenv'
dotenv.config();
import express from "express";
import cookieParser from 'cookie-parser';

const app = express();

app.get("/", (req, res) => {
    res.send("Hello broo")
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));

// import routes
import userRoutes from './routes/user.routes';

// use routes
app.use('/api/v1/user', userRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port: http://localhost:${process.env.PORT}`);
})