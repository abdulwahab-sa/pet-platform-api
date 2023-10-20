const jwt = require('jsonwebtoken');

const generateToken = (res, email) => {
	const token = jwt.sign({ email }, process.env.JWT_SECRET, {
		expiresIn: '30d',
	});

	res.cookie('jwt', token, {
		httpOnly: true,
		maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		secure: true,
		sameSite: 'none',
	});

	return token;
};

module.exports = generateToken;
