const mongoose = require("mongoose")
const Scoreboard = require("../Schema/scoreboard")
const College = require("../Schema/college")
const Department = require("../Schema/department")
const Performance = require("../Schema/performance")
const Ranking = require("../Schema/ranking")
const Scoring = require("../Schema/scores")
const User = require("../Schema/user")
const Exam = require("../Schema/events")

const SuperAdmin = require("../Schema/superadmin")
const jwt = require("jsonwebtoken")
const { section } = require("./edit")
const secret = process.env.secret || "SuperK3y";

async function profileID(token) {
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

async function userprofileID(token) {
    var tok = token.headers.authorization;
    var id;
    try {
        tok = tok.slice(7,tok.length)
        id = jwt.verify(tok, secret);
    }
    catch(err) {
        id = null;
    }
    const user = await User.findOne({_id:id.id});
    if(user) {
        return user;
    }
    else {
        return null;
    }
}

exports.admin = async(req,res) => {
    const {examID} = req.params;
    var exam = await Exam.findOne({_id:examID})
    if(!exam) {
        return res.json({status:"Exam not found"});
    }
    var sections = exam?.sections
    var department = exam?.department

    var users = await User.aggregate(
        [
            {
                $match: {
                    department: {$in:department}
                }
            },
            {
              $addFields:
                /**
                 * newField: The new field name.
                 * expression: The new field expression.
                 */ 
                {
                  collegeInfo: {
                    $toObjectId: "$college",
                  },
                  departmentInfo: {
                    $toObjectId: "$department",
                  },
                },
            },
            {
              $lookup:
                /**
                 * from: The target collection.
                 * localField: The local join field.
                 * foreignField: The target join field.
                 * as: The name for the results.
                 * pipeline: Optional pipeline to run on the foreign collection.
                 * let: Optional variables to use in the pipeline field stages.
                 */
                {
                  from: "colleges",
                  localField: "collegeInfo",
                  foreignField: "_id",
                  as: "collegeInfo",
                },
            },
            {
              $lookup:
                /**
                 * from: The target collection.
                 * localField: The local join field.
                 * foreignField: The target join field.
                 * as: The name for the results.
                 * pipeline: Optional pipeline to run on the foreign collection.
                 * let: Optional variables to use in the pipeline field stages.
                 */
                {
                  from: "departments",
                  localField: "departmentInfo",
                  foreignField: "_id",
                  as: "departmentInfo",
                },
            },
            {
              $unwind: "$departmentInfo",
            },
            {
              $unwind: "$collegeInfo",
            },
            {
              $project:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                  name: 1,
                  _id: 1,
                  username: 1,
                  role: 1,
                  rollno: 1,
                  collegeID: "$college",
                  departmentID: "$department",
                  college: "$collegeInfo.college",
                  department: "$departmentInfo.department",
                  year: "$departmentInfo.year",
                  semester: "$departmentInfo.semester",
                  section: "$departmentInfo.section",
                },
            },
          ])

    var student = new Array();
    console.log(sections);
    for(let user of users) {
        let scores = await Scoring.find({studentid:user?._id,sectionid:{$in:sections}})
        if(scores.length > 0) {
            student.push({
                "_id": user._id,
                "name": user.name,
                "username": user.username,
                "role": user.role,
                "rollno": user.rollno,
                "collegeID": user.collegeID,
                "departmentID": user.departmentID,
                "college": user.college,
                "department": user.department,
                "year": user.year,
                "semester": user.semester,
                "section": user.section,
                status:"attended",
                score:scores
            })
        }
        else {
            student.push({
                "_id": user._id,
                "name": user.name,
                "username": user.username,
                "role": user.role,
                "rollno": user.rollno,
                "collegeID": user.collegeID,
                "departmentID": user.departmentID,
                "college": user.college,
                "department": user.department,
                "year": user.year,
                "semester": user.semester,
                "section": user.section,
                status:"unattend",
            })
        }
    }

    return res.json({student:student})
}