const Joi = require('joi').extend(require('@joi/date'));

const validateCredentials = (data) => {
	const schema = Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().min(6).max(30).required(),
	});

	const { error, value } = schema.validate(data);
	return { error, value };
};

const createPetSchema = Joi.object({
	petName: Joi.string().min(3).required(),
	species: Joi.string().min(3).required(),
	breed: Joi.string().min(3).required(),
	birthDate: Joi.date().format(['YYYY/MM/DD', 'DD-MM-YYYY']).required(),
	color: Joi.string().min(3).required(),
	weight: Joi.string().required(),
	lastPinnedLocation: Joi.string().required(),
	petImg: Joi.string().required(),
});

const updatePetSchema = Joi.object({
	petName: Joi.string().min(3),
	species: Joi.string().min(3),
	breed: Joi.string().min(3),
	birthDate: Joi.date().format(['YYYY/MM/DD', 'DD-MM-YYYY']),
	color: Joi.string().min(3),
	weight: Joi.string(),
	lastPinnedLocation: Joi.string(),
	petImg: Joi.string(),
});

const validatePet = (data, isUpdate = false) => {
	const schema = isUpdate ? updatePetSchema : createPetSchema;
	const { error, value } = schema.validate(data);
	return { error, value };
};

const validateReminder = (data) => {
	const schema = Joi.object({
		reminderNote: Joi.string().min(3).required(),
		reminderDate: Joi.date().format(['YYYY/MM/DD', 'DD-MM-YYYY']).required(),
		petId: Joi.number().required(),
	});
	const { error, value } = schema.validate(data);
	return { error, value };
};

module.exports = { validateCredentials, validatePet, validateReminder };
