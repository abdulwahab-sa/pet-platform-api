require('dotenv').config();
const express = require('express');
const router = require('./routes/route.js');
const app = express();
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');
const cookieParser = require('cookie-parser');

app.use(
	cors({
		credentials: true,
		origin: 'https://pet-platform.netlify.app',
	})
);

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', 'https://pet-platform.netlify.app');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, HEAD, DELETE');
	next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT || 3005, () => {
	console.log('Backend is working!');
});
