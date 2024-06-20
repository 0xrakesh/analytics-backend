const mongoose = require("mongoose")

const Schema = mongoose.Schema({
    studentid: {type:mongoose.Schema.Types.ObjectId},
    sectionid: {type:mongoose.Schema.Types.ObjectId},
    category: {type:String},
    points: {type:Number},
    overAllPoint: {type:Number},
    questions:{type:Array},
    performance: [{
        number: {type:Number},
        output:{type:Array},
        testcase:{type:Array},
    }]
})

const Score = new mongoose.model("pgscores",Schema);

module.exports = Score;
