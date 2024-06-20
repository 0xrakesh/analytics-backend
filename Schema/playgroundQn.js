const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    title: {type: String},
    date: {type: Date},
    start: {type: Date},
    end: {type: Date},
    duration: {type: Number},
    sections: {type:mongoose.Types.ObjectId, required: true},
    department: {type: Array},
    college: {type: Object},
    overallRating: {type: Number},
})

const Event = new mongoose.model("playgroundQns",Schema);

module.exports = Event;
