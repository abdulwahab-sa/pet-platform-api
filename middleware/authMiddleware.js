const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET;

// Middleware to authenticate the user
const protect = asyncHandler(async (req, res, next) => {
	let token;
	token = req.cookies.jwt;

	try {
		if (token) {
			const decoded = jwt.verify(token, secretKey);

			const user = await prisma.user.findUnique({
				where: {
					email: decoded.email,
				},
			});

			if (!user) {
				return res.status(400).json('Not authorized, Token Failed!');
			}

			req.user = user;
			next();
		} else {
			res.status(401).json({ message: 'Not authorized, no token' });
		}
	} catch (error) {
		res.status(401).json({ message: 'Not authorized, Token Failed!' });
	}
});

module.exports = { protect };
