const Meet = require("../Schema/meeting");
const SuperAdmin = require("../Schema/superadmin")
const User = require("../Schema/user")
const Admin = require("../Schema/admin")
const College = require("../Schema/college")
const Department = require("../Schema/department")
const jwt = require("jsonwebtoken")
const secret = process.env.secret || "SuperK3y"
const Exam = require("../Schema/events")
const Section = require("../Schema/sections")
const Performance = require("../Schema/performance")
const Rank = require("../Schema/ranking")
const ScoreBoard = require("../Schema/scoreboard")
const Scoring = require("../Schema/scores")
const Event = require("../Schema/techevent")

async function profileID(token) {
    var tok = token.headers.authorization;
    tok = tok.substring(7);
    var id;
    try {
        id = await jwt.verify(tok, secret);
    }
    catch(err) {
        id = null;
    }
    const user = await User.findOne({_id:id.id});
    if(user) {
        return user;
    }
    else {
        const superadmin = await SuperAdmin.findOne({_id:id.id});
        if(superadmin) {
            return superadmin
        }
        else {
            const admin = await Admin.findOne({_id:id.id});
            if(admin) {
                return admin
            }
            else null;
        }
    }
}


exports.student = async (req,res) => {
    const person = await profileID(req);

    const college = await College.findOne({ _id: person.college });
    const department = await Department.findOne({ _id: person.department });

    const performance = await Performance.find({studentid:person._id})
    var numberOfExams = performance.length;
    var numberOfSection = 0;
    var numberOfMcq = await Performance.find({studentid:person._id,category:'mcq'}).count()
    var numberOfCod = await Performance.find({studendid:person._id,category:"coding"}).count()
    var numberOfBot = await Performance.find({studentid:person._id,category:"both"}).count()

    var overallpoint = 0;
    var point = 0;
    var OverAllPerf = new Array();
    for(let perf of performance) {
        var allSection = new Array();
        var studentPerf = new Array();
        point += perf.obtainpoint
        numberOfSection += (perf.sections).length
        let exam = await Exam.findOne({_id:perf.examid});
        overallpoint+=exam.overallRating;
        for(let score of exam.sections) {
            let section = await Section.findOne({_id:score},{questions:0})
            let studentScore = await Scoring.findOne({sectionid:score})
            studentPerf.push(studentScore)
            allSection.push(section)
        }
        OverAllPerf.push({
            exam:exam,
            section:allSection,
            scores:studentPerf
        });
    }
    const scoreboard = await ScoreBoard.find({department:person.department},{exams:0,department:0,college:0}).limit(5)
    const ranking = await Rank.findOne({studentid:person._id},{college:0,department:0})

    return res.json({
        user:person.name,
        college: college.college,
        department: department.department,
        year: department.year,
        semester: department.semester,
        section: department.section,
        mcq:numberOfMcq,
        coding:numberOfCod,
        both:numberOfBot,
        overallpoint:overallpoint,
        point: point,
        graph: OverAllPerf,
        scoreboard: scoreboard,
        ranking:ranking
    })
}


exports.studentDetail = async (req,res) => {
    const {userID} = req.params;
    try {

        const person = await await User.findOne({_id:userID})
        
        if(!person) {
            return res.json({status:"User not found"})
        }
        const college = await College.findOne({ _id: person.college });
        const department = await Department.findOne({ _id: person.department });

        const performance = await Performance.find({studentid:person._id})
        var numberOfExams = performance.length;
        var numberOfSection = 0;
        var numberOfMcq = await Performance.find({studentid:person._id,category:'mcq'}).count()
        var numberOfCod = await Performance.find({studendid:person._id,category:"coding"}).count()
        var numberOfBot = await Performance.find({studentid:person._id,category:"both"}).count()

        var overallpoint = 0;
        var point = 0;
        var OverAllPerf = new Array();
        for(let perf of performance) {
            var allSection = new Array();
            var studentPerf = new Array();
            point += perf.obtainpoint
            numberOfSection += (perf.sections).length
            let exam = await Exam.findOne({_id:perf.examid});
            overallpoint+=exam.overallRating;
            for(let score of exam.sections) {
                let section = await Section.findOne({_id:score},{questions:0})
                let studentScore = await Scoring.findOne({sectionid:score})
                studentPerf.push(studentScore)
                allSection.push(section)
            }
            OverAllPerf.push({
                exam:exam,
                section:allSection,
                scores:studentPerf
            });
        }
        const scoreboard = await ScoreBoard.find({department:person.department},{exams:0,department:0,college:0}).limit(5)
        const ranking = await Rank.findOne({studentid:person._id},{college:0,department:0})

        return res.json({
            user:person.name,
            college: college.college,
            department: department.department,
            year: department.year,
            semester: department.semester,
            section: department.section,
            mcq:numberOfMcq,
            coding:numberOfCod,
            both:numberOfBot,
            overallpoint:overallpoint,
            point: point,
            graph: OverAllPerf,
            scoreboard: scoreboard,
            ranking:ranking
        })
    }
    catch(e) {
        return res.json({status:"User not found"})
    }
}

exports.admin = async(req,res) => {
    const exam =  await Exam.find({end: {$gt: new Date().getTime()}}).limit(5);
    const event = await Event.find({}).limit(5);
    const score = await ScoreBoard.find({}).sort({scores:-1}).limit(5)
    return res.json({exam:exam,event:event,scoreboard:score});
}


exports.superadmin = async(req,res) => {
    const user = await profileID(req);

    const exam =  await Exam.find({end: {$gt: new Date().getTime()}, college:user.college}).limit(5);
    const event = await Event.find({}).limit(5);
    const score = await ScoreBoard.find({college:user.college}).sort({scores:-1}).limit(5)
    return res.json({exam:exam,event:event,scoreboard:score});
}
