const mongoose = require("mongoose")
const schema = {
	name: {type: String},
	userid: {type: String},
	question: {type:String},
	input: {type: Array},
	code: {type: String},
	language: {type: String},
}

const Playground = new mongoose.model("playgrounds",schema);

module.exports = Playground;
