const express = require('express');
const router = express.Router();

const {
	registerUserController,
	loginUserController,
	createPetController,
	updatePetController,
	deletePetController,
	getPetsController,
	getSinglePetController,
	createReminderController,
	getRemindersController,
	getSingleReminderController,
	deleteReminderController,
} = require('../controllers/controller.js');

const { protect } = require('../middleware/authMiddleware.js');

// GET ROUTES
router.route('/getpets').get(protect, getPetsController);
router.route('/getpet/:petId').get(protect, getSinglePetController);
router.route('/getreminders').get(protect, getRemindersController);
router.route('/getreminder/:reminderId').get(protect, getSingleReminderController);

// PUT ROUTES
router.route('/updatepet/:petId').put(protect, updatePetController);

// POST ROUTES
router.route('/createpet').post(protect, createPetController);
router.route('/createreminder').post(protect, createReminderController);
router.route('/registeruser').post(registerUserController);
router.route('/loginuser').post(loginUserController);

// DELETE ROUTES
router.route('/deletepet/:petId').delete(protect, deletePetController);
router.route('/deletereminder/:id').delete(protect, deleteReminderController);

module.exports = router;
