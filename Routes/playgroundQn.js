const mongoose = require("mongoose")
const Code = require("./CodingQN")
const College = require("../Schema/college")
const Section = require("../Schema/playgroundSections")
const Playground = require('../Schema/playgroundQn')
const secret = process.env.secret || "SuperK3y";
const Scoring = require("../Schema/playgroundScoring.js")
const User = require("../Schema/user")
const SuperAdmin = require("../Schema/superadmin")
const jwt = require("jsonwebtoken")

exports.new = async (req,res) => {
    const { title, date, start,end,college, department, questions} = req.body;
    var overAllPoint = 0;
    var overDuration = 0;
    const {name,category,hours,minutes,qn} = questions;
    let duration = (hours*60) + minutes;
    overDuration = (duration === undefined || duration === null) ? null : duration;
            // Calculate the score

    for(let question of qn) {
                    // Output
                    for(let out of question.output) {
                        overAllPoint += out.rating
                    }
    
                    // Testcase
                    for(let test of question.testcase) {
                        overAllPoint += test.rating
                    }
    }
    if(duration===null||hours===undefined||minutes===undefined){
	var sect = await Section({
		name:name,
		category:category,
		questions:qn
	})
    }
    else {
 	console.log("Here")
        var sect = await Section({
                name: name,
                category: category,
                time: duration,
                questions: qn
    });
    }
    let sectionID = await sect.save();
    

    // Create a exam 
    var newExam = await Playground({
        title: title,
        category: category,
        date: date,
        start: start,
        end: end,
        sections: sectionID._id,
        department: department,
        college: college,
        overallRating: overAllPoint
    });
    // Save the test
    newExam.save()
    .then( (newEvt) => {
        res.json({response:`Added new playground`})
    })
    .catch((err) => res.json({response:`Something wrong.\nBacktrack\n${err}`}))
}

exports.admin = async(req,res) => {
    try{
        let playground = await Playground.find({})
        return res.status(200).json({playground:playground})
    }
    catch(err) {
        return res.status(500).json({status:"Something went wrong"})
    }
}


async function saprofileID(token) {
    var tok = token.headers.authorization;
    var id;
    try {
        tok = tok.slice(7,tok.length)
        id = jwt.verify(tok, secret);
    }
    catch(err) {
        id = null;
    }
    const user = await SuperAdmin.findOne({_id:id.id});
    if(user) {
        return user;
    }
    else {
        return null;
    }
}

async function profileID(token) {
    var tok = token.headers.authorization;
    var id;
    try {
        tok = tok.slice(7,tok.length)
        console.log(tok)
        id = jwt.verify(tok, secret);
    }
    catch(err) {
        id = null;
    }
    console.log(id,secret);
    const user = await User.findOne({_id:id.id});
    if(user) {
        return user;
    }
    else {
        return null;
    }
}

exports.superadmin = async(req,res) => {
    try{
        let user = await saprofileID(req);
        let playground = await Playground.find({college:user?.department})
        return res.status(200).json({playground:playground})
    }
    catch(err) {
        return res.status(500).json({status:"Something went wrong"})
    }
}

exports.student = async(req,res) => {
    try{
        let user = await profileID(req);
	console.log(user)
        let playground = await Playground.aggregate([
            {
                $match:{
                    department: {$elemMatch: {$eq: user?.department}},
                    college: {$eq: user?.college}
                }
            }
        ])
        return res.status(200).json({playground:playground})
    }
    catch(err) {
        return res.status(500).json({status:"Something went wrong",err:err})
    }
}

exports.details = async(req,res) => {
	const {playID} = req.params;
	var user = await profileID(req);
	let playground = await Playground.aggregate(
[ 
  {
	                $match:{
                    department: {$elemMatch: {$eq: user?.department}},
                    college: {$eq: user?.college},
    	            _id: {$eq: new mongoose.Types.ObjectId(playID)}
    }

  },
  {
    $lookup:
      {
        from: "trainingsections",
        localField: "sections",
        foreignField: "_id",
        as: "sections",
      },
  },
  {
    $unwind:
      /**
       * path: Path to the array field.
       * includeArrayIndex: Optional name for index.
       * preserveNullAndEmptyArrays: Optional
       *   toggle to unwind null and empty values.
       */
      {
        path: "$sections",
        includeArrayIndex: "0",
        preserveNullAndEmptyArrays: true,
      },
  },
]
	)
	return res.json({playground:playground})
}


exports.examEval = async(req,res) => {
    const { playgroundID,sectionID } = req.params;
    var exam = await Playground.findOne({_id: playgroundID});
    var section = await Section.findOne({_id:sectionID})
    const {questions} = req.body;

    const user = await profileID(req);
    const userID = user._id

    if(section.category === "coding") {
        const {questions} = req.body;
        let sectionQN;
        for(let sec of section.questions) {
            if(sec.number === questions.number) {
                sectionQN = sec
            }
        }
        // Verified Output
        const {result,testcase} = await Code.evaluate(playgroundID, questions,sectionQN, userID,section.show);

        return res.json({result,testcase})
    }
}

exports.examSubmit = async(req,res) => {
    const { playgroundID,sectionID } = req.params;
    var section = await Section.findOne({_id:sectionID})

    var userID = await profileID(req);
	userID= userID._id
    if(section.category === "coding") {
        const {questions} = req.body;
        let sectionQN;
        for(let sec of section.questions) {
            if(sec.number === questions.number) {
                sectionQN = sec
            }
        }
        // Verified Output
        var {result,testcase} = await Code.evaluate(playgroundID, questions,sectionQN, userID,section.show);

        var rating = 0;
        var overPoint = 0;
        var question = section.questions;

	console.log(result,testcase)
        result.map((qn,item) => {
            if(qn.status === "correct") {
                rating += qn.rating
            }
            else if(qn.status === "incorrect"){
                rating = rating
            }
            overPoint += qn.rating
        })

	testcase = testcase[0]

        testcase?.map((qn,item) => {
            if(qn.status === "correct") {
                rating += qn.rating
            }
            else if(qn.status === "incorrect"){
                rating = qn.rating
            }
            overPoint += qn.rating
        })

        var studentPerformance = {
            number: questions.number,
            output: result,
            testcase: testcase
        }
	let studentScore = await Scoring.findOne({sectionid:sectionID,studentid:userID, category: section.category});
        if(!studentScore) {
            let newScore = await Scoring({
	        studentid: userID,
                sectionid: sectionID,
                category: section.category,
                points: rating,
                overAllPoint: overPoint,
                questions: [questions.number],
                performance: studentPerformance
            });

            await newScore.save().then(async (doc) => {
                return res.status(200).json({result:doc})
            }).
            catch((err) => {
                console.log(err,"eroor")
                return res.json({status:"Something went wrong", code:301,error:err})
            })


        }
        else {
            if(studentScore.questions.includes(questions.number)){
                return res.json({status:"You have been already submit it", sectionID:sectionID, examID:playgroundID, sectionResult: studentScore})
            }
		console.log(rating)
       	    await Scoring.findOneAndUpdate({sectionid:sectionID,studentid:userID,category:section.category}, { $push: {questions: questions.number, performance:studentPerformance}, $inc: {points:rating,overAllPoint:overPoint}})
            let sec = await Scoring.findOne({sectionid:sectionID,studentid:userID,category:section.category})
            let doc = {
                "studentid": sec.studentid,
                "sectionid": sec.sectionid,
                "category": section.category,
                "points": sec.points,
                "overAllPoint":sec.overAllPoint,
                "performance": studentPerformance
            }
            return res.json({result: doc})
	}
    }
}


exports.getResult = async(req,res) => {
        const { playgroundID,sectionID } = req.params;
        var user = await profileID(req);
        var userID = user._id
        let sec = await Scoring.findOne({sectionid:sectionID,studentid:userID,category:"coding"})
        return res.json({result:sec});
}
