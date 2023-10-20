const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validateCredentials, validatePet, validateReminder } = require('../utils/validator.js');

////////////////  USERS 	 //////////////////////

// @desc    Register a new user
// @route   POST /api/registeruser
// @access  Public

const registerUserController = asyncHandler(async (req, res) => {
	const { error, value } = validateCredentials(req.body);

	if (error) {
		return res.status(400).json(error.details[0].message);
	}

	const { email, password } = value;

	try {
		// check if the email already exists in the database

		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});

		if (user) {
			return res.status(400).json('User already exists!');
		}

		// if the email does not exist, hash the password and create a new user in the database

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await prisma.user.create({
			data: {
				email: email,
				password: hashedPassword,
			},
		});

		res.status(201).json({ message: 'User created successfully!', user: newUser.email });
	} catch (error) {
		res.status(500).json({ error: error.message, message: 'Internal Server Error' });
	}
});

// @desc    Login user
// @route   POST /api/loginuser
// @access  Public

const loginUserController = asyncHandler(async (req, res) => {
	const { error, value } = validateCredentials(req.body);

	if (error) {
		return res.status(400).json(error.details[0].message);
	}

	const { email, password } = value;

	try {
		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});

		const isPasswordCorrect = await bcrypt.compare(password, user.password);

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ message: 'Invalid credentials!' });
		}

		const { token } = generateToken(res, user.email);

		res.status(200).json({ message: 'Logged in successfully!', user: user.email, token });
	} catch (error) {
		res.status(500).json({ error: error.message, message: 'Internal Server Error' });
	}
});

// POST REQUEST TO LOGOUT USER

const logoutUserController = (req, res) => {
	res.cookie('jwt', '', {
		httpOnly: true,
		expires: new Date(0),
	});
	res.status(200).json({ message: 'Logged out successfully' });
};

////////////////////    PETS 	 //////////////////////

// @desc    Create a new pet
// @route   POST /api/createpet
// @access  Private

const createPetController = asyncHandler(async (req, res) => {
	const { error, value } = validatePet(req.body);

	if (error) {
		return res.status(400).json(error.details[0].message);
	}

	try {
		const { id: userId } = req.user;
		const { petName, species, breed, birthDate, color, weight, lastPinnedLocation, petImg } = value;

		const newPet = await prisma.pet.create({
			data: {
				petName,
				species,
				breed,
				birthDate,
				color,
				weight,
				lastPinnedLocation,
				petImg,
				ownerId: userId,
			},
		});

		res.status(201).json({ message: 'Pet created successfully!', pet: newPet });
	} catch (error) {
		res.status(500).json({ error: error.message, message: 'Internal Server Error' });
	}
});

// @desc    Update pet
// @route   PUT /api/updatepet/:petId
// @access  Private

const updatePetController = asyncHandler(async (req, res) => {
	const { error, value } = validatePet(req.body, true);

	if (error) {
		return res.status(400).json(error.details[0].message);
	}

	const { petId } = req.params;
	const { petName, species, breed, birthDate, color, weight, lastPinnedLocation, petImg } = value;

	try {
		const pet = await prisma.pet.findUnique({
			where: {
				id: parseInt(petId),
				ownerId: req.user.id,
			},
		});

		if (!pet) {
			return res.status(404).json({ message: 'Pet not found!' });
		}

		const updatedPet = await prisma.pet.update({
			where: {
				id: parseInt(petId),
			},
			data: {
				petName,
				species,
				breed,
				birthDate,
				color,
				weight,
				lastPinnedLocation,
				petImg,
			},
		});

		res.status(200).json({ message: 'Pet updated successfully!', pet: updatedPet });
	} catch (error) {
		res.status(500).json({ error: error.message, message: 'Internal Server Error' });
	}
});

// @desc    Delete pet
// @route   DELETE /api/deletepet/:petId
// @access  Private

const deletePetController = asyncHandler(async (req, res) => {
	const { petId } = req.params;
	console;
	try {
		const pet = await prisma.pet.findUnique({
			where: {
				id: parseInt(petId),
				ownerId: req.user.id,
			},
		});

		if (!pet) {
			return res.status(404).json({ message: 'Pet not found!' });
		}

		const deletedPet = await prisma.pet.delete({
			where: {
				id: parseInt(petId),
			},
		});

		res.status(200).json({ message: 'Pet deleted successfully!', pet: deletedPet });
	} catch (error) {
		res.status(500).json({ error: error.message, message: 'Internal Server Error' });
	}
});

// @desc 	   Get all pets
// @route      GET /api/getpets
// @access     Private

const getPetsController = asyncHandler(async (req, res) => {
	try {
		const pets = await prisma.pet.findMany({
			where: {
				ownerId: req.user.id,
			},
		});

		if (pets.length === 0) {
			return res.status(404).json({ message: 'No pets found!' });
		}

		res.status(200).json({ message: 'success', data: pets });
	} catch (error) {
		res.status(500).json({ error: error.message, message: 'Internal Server Error' });
	}
});

// @desc         Get single pet
// @route        GET /api/getpet/:petId
// @access       Private

const getSinglePetController = asyncHandler(async (req, res) => {
	const { petId } = req.params;

	try {
		const pet = await prisma.pet.findUnique({
			where: {
				id: parseInt(petId),
				ownerId: req.user.id,
			},
		});

		if (!pet) {
			return res.status(404).json({ message: 'Pet not found!' });
		}

		res.status(200).json({ message: 'success', data: pet });
	} catch (error) {
		res.status(500).json({ error: error.message, message: 'Internal Server Error' });
	}
});

//////////////////////       REMINDERS 	 //////////////////////

// @desc    Create a new reminder
// @route   POST /api/createreminder
// @access  Private

const createReminderController = asyncHandler(async (req, res) => {
	const { error, value } = validateReminder(req.body);

	if (error) {
		return res.status(400).json(error.details[0].message);
	}

	try {
		const { id: userId } = req.user;
		const { petId, reminderDate, reminderNote } = value;

		const newReminder = await prisma.reminder.create({
			data: {
				userId: userId,
				petId,
				reminderDate,
				reminderNote,
			},
		});

		res.status(201).json({ message: 'Reminder created successfully!', reminder: newReminder });
	} catch (error) {
		res.status(500).json({ error: error.message, message: 'Internal Server Error' });
	}
});

// @desc       Get all reminders
// @route      GET /api/getreminders
// @access     Private

const getRemindersController = asyncHandler(async (req, res) => {
	const { petId } = req.query;
	const userId = req.user.id;

	try {
		let remindersQuery = {
			where: {
				userId,
			},
		};

		if (petId) {
			const pet = await prisma.pet.findUnique({
				where: {
					id: parseInt(petId),
					ownerId: req.user.id,
				},
			});

			if (!pet) {
				return res.status(404).json({ message: 'Pet not found!' });
			}

			remindersQuery.where.petId = parseInt(petId);
		}

		const reminders = await prisma.reminder.findMany(remindersQuery);

		if (reminders.length === 0) {
			return res.status(404).json({ message: 'No reminders found!' });
		}

		res.status(200).json({ message: 'success', data: reminders });
	} catch (error) {
		res.status(500).json({ error: error.message, message: 'Internal Server Error' });
	}
});

// @desc         Get single reminder
// @route        GET /api/getreminder/:reminderId
// @access       Private

const getSingleReminderController = asyncHandler(async (req, res) => {
	const { reminderId } = req.params;

	try {
		const reminder = await prisma.reminder.findUnique({
			where: {
				id: parseInt(reminderId),
				userId: req.user.id,
			},
		});

		if (!reminder) {
			return res.status(404).json({ message: 'Reminder not found!' });
		}

		res.status(200).json({ message: 'success', data: reminder });
	} catch (error) {
		res.status(500).json({ error: error.message, message: 'Internal Server Error' });
	}
});

// @desc    Delete reminder
// @route   DELETE /api/deletereminder/:reminderId
// @access  Private

const deleteReminderController = asyncHandler(async (req, res) => {
	const { reminderId } = req.params;

	try {
		const reminder = await prisma.reminder.findUnique({
			where: {
				id: parseInt(reminderId),
				userId: req.user.id,
			},
		});

		if (!reminder) {
			return res.status(404).json({ message: 'Reminder not found!' });
		}

		const deletedReminder = await prisma.reminder.delete({
			where: {
				id: parseInt(reminderId),
			},
		});

		res.status(200).json({ message: 'Reminder deleted successfully!', reminder: deletedReminder });
	} catch (error) {
		res.status(500).json({ error: error.message, message: 'Internal Server Error' });
	}
});

module.exports = {
	registerUserController,
	loginUserController,
	logoutUserController,
	createPetController,
	updatePetController,
	deletePetController,
	getPetsController,
	getSinglePetController,
	createReminderController,
	getRemindersController,
	getSingleReminderController,
	deleteReminderController,
};
