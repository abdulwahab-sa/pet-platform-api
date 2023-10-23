require('dotenv').config();
const express = require('express');
const router = require('./routes/route.js');
const app = express();
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');
const cookieParser = require('cookie-parser');

app.use(
	cors({
		origin: 'https://pet-platform.netlify.app',
		credentials: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		allowedHeaders: 'Content-Type,Authorization',
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', router);
app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT || 3005, () => {
	console.log('Backend is working!');
});
