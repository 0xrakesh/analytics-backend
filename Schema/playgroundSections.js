const mongoose = require("mongoose")

const Schema = mongoose.Schema({
    name:{type: String},
    category: {type: String,required: true},
    time: {type: Number,},
    questions: {
        type: Array,
    },
    show: {type: Boolean, default: false}
})

const Exam = new mongoose.model("trainingSections",Schema);

module.exports = Exam;
