const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const validator = require('validator');
const connection = require('../db/dbConfig.js');

const saltRounds = 10;

const generateAccessToken = (user) => {
	return jwt.sign({ id: user.id, email: user.email }, 'mySecretKey', {
		expiresIn: '1hr',
	});
};

const generateRefreshToken = (user) => {
	return jwt.sign({ id: user.id, email: user.email }, 'myRefreshSecretKey');
};

const hashPassword = async (password) => {
	const hashedPass = await bcrypt.hash(password, saltRounds);
	return hashedPass;
};

const saveUserToDatabase = (user) => {
	return new Promise((resolve, reject) => {
		connection.query('INSERT INTO user SET ?', user, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results.insertId);
			}
		});
	});
};

const getUserFromDatabase = (email) => {
	return new Promise((resolve, reject) => {
		connection.query('SELECT * FROM user WHERE email = ?', [email], (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results[0]);
			}
		});
	});
};

const isEmailValid = (email) => {
	// Email validation logic

	return validator.isEmail(email);
};

const registerController = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!isEmailValid(email)) {
			return res.status(400).json('Invalid email format!');
		}

		const hashedPassword = await hashPassword(password);

		const user = {
			email,
			password: hashedPassword,
		};

		const { user_id } = await saveUserToDatabase(user);

		// Generate tokens for the newly registered user
		const accessToken = generateAccessToken({ id: user_id, email });
		const refreshToken = generateRefreshToken({ id: user_id, email });

		res.json({
			accessToken,
			refreshToken,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json('An error occurred.');
	}
};

const loginController = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await getUserFromDatabase(email);

		if (user) {
			const checkPassword = await bcrypt.compare(password, user.password);
			if (checkPassword) {
				const accessToken = generateAccessToken({ id: user.user_id, email });
				const refreshToken = generateRefreshToken({ id: user.user_id, email });
				refreshTokens.push(refreshToken);
				res.json({
					accessToken,
				});
			} else {
				res.status(400).json('Username or password incorrect!');
			}
		} else {
			res.status(400).json('User not found!');
		}
	} catch (err) {
		console.error(err);
		res.status(500).json('An error occurred.');
	}
};

const refreshController = async (req, res) => {
	try {
		const refreshToken = req.body.token;

		if (!refreshToken) {
			return res.status(401).json('You are not authenticated!');
		}

		if (!refreshTokens.includes(refreshToken)) {
			return res.status(403).json('Refresh token is not valid!');
		}

		jwt.verify(refreshToken, 'myRefreshSecretKey', (err, user) => {
			if (err) {
				console.log(err);
				return res.status(403).json('Invalid refresh token!');
			}

			refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

			const newAccessToken = generateAccessToken(user);
			const newRefreshToken = generateRefreshToken(user);

			refreshTokens.push(newRefreshToken);

			res.status(200).json({
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
			});
		});
	} catch (err) {
		console.error(err);
		res.status(500).json('An error occurred.');
	}
};

let refreshTokens = [];

module.exports = { registerController, loginController, refreshController };

/*{
    "petName" : "goldie",
    "species": "German Shephered",
    "breed": "German",
    "birtDate": "2021-12-12",
    "color": "Brown",
    "weight": "20 pounds",
    "lastPinnedLocation": "test city 12121"

} 
{
   "email": "aws18320@gmail.com",
   "password": "Test12345-"

}


{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhd3MxODMyMEBnbWFpbC5jb20iLCJpYXQiOjE2ODUwMzgyOTIsImV4cCI6MTY4NTAzODY5Mn0.FhFrnIFvY3BnBob63cHnF2pfYV34mRcoP_fcf0ohvZg"
}

{
    "petName" : "goldie",
    "dateOfReminder": "2023-05-25",
    "note": "Take him to the Doc"

} 



*/
