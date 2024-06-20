const Scoreboard = require("../Schema/scoreboard")
const College = require("../Schema/college")
const Department = require("../Schema/department")
const Performance = require("../Schema/performance")
const Ranking = require("../Schema/ranking")
const Scoring = require("../Schema/scores")
const User = require("../Schema/user")

const SuperAdmin = require("../Schema/superadmin")
const jwt = require("jsonwebtoken")
const secret = process.env.secret || "SuperK3y";

exports.admin = async(req,res) => {
    try {
        let students = await Scoreboard.aggregate([
            {
              '$addFields': {
                'collegeID': {
                  '$toObjectId': '$college'
                }
              }
            }, {
              '$lookup': {
                'from': 'colleges', 
                'localField': 'collegeID', 
                'foreignField': '_id', 
                'as': 'collegeDetail'
              }
            }, {
              '$unwind': {
                'path': '$collegeDetail', 
                'includeArrayIndex': '0', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$project': {
                'name': '$studentName', 
                'studentid': '$studentid', 
                'department': '$departmentName', 
                'year': 1, 
                'section': 1, 
                'college': '$collegeDetail.college', 
                'place': '$collegeDetail.place', 
                'exams': 1, 
                'scores': 1, 
                'collegeID': 1
              }
            }
          ])
        return res.json({students:students});
    }
    catch(err) {
        return res.status(500).json({status:"Something went wrong"})
    }
}

exports.scores = async(req,res) => {
    try {

        let students = await Scoreboard.aggregate([
          {
            $lookup: {
              from: "examsInfo",
              localField: "examid",
              foreignField: "_id",
              as: "exams",
            },
          },
          {
            $unwind:
              {
                path: "$exams",
                includeArrayIndex: "0",
                preserveNullAndEmptyArrays: true,
              },
          },
          {
            $project: {
              studentid: 1,
              points: 1,
              obtainpoint: 1,
              exams: 1,
            },
          },
          {
            $group: {
              _id: {
                studentid: "$studentid",
              },
              studentid: {
                $first: "$studentid",
              },
              exams: {
                $push: "$exams",
              },
              points: {
                $sum: "$points",
              },
              obtainpoint: {
                $sum: "$obtainpoint",
              },
            },
          },
        ])
        return res.json({students:students});

    }
    catch(err) {
        return res.status(500).json({status:"Something went wrong"})
    }
}

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

exports.superadmin = async(req,res) => {
    const user = await profileID(req);
    try {
        let students = await User.aggregate([
            {
              $match:
                {
                  college: {
                    $eq: user.college,
                  },
                },
            },
            {
              $lookup:
                {
                  from: "scoreboardBills",
                  localField: "_id",
                  foreignField: "studentid",
                  as: "record",
                },
            },
            {
              $addFields:
                {
                  department: {
                    $toObjectId: "$department",
                  },
                  college: {
                    $toObjectId: "$college",
                  },
                  departmentID: {
                    $toObjectId: "$department",
                  },
                  collegeID: {
                    $toObjectId: "$college",
                  },
                },
            },
            {
              $lookup:
                {
                  from: "colleges",
                  localField: "college",
                  foreignField: "_id",
                  as: "college",
                },
            },
            {
              $lookup:
                {
                  from: "departments",
                  localField: "department",
                  foreignField: "_id",
                  as: "department",
                },
            },
            {
              $unwind:
                {
                  path: "$department",
                  includeArrayIndex: "0",
                  preserveNullAndEmptyArrays: true,
                },
            },
            {
              $unwind: "$college",
            },
            {
              $project:
                {
                  _id: 1,
                  name: 1,
                  username: 1,
                  role: 1,
                  rollno: 1,
                  college: 1,
                  collegeID: 1,
                  department: 1,
                  departmentID: 1,
                  email: 1,
                  record: 1,
                },
            },
          ])
        return res.json({students:students});
    }
    catch(err) {
        return res.status(500).json({status:"Something went wrong"})
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

exports.student = async(req,res) => {
    const user = await userprofileID(req);
    try {
        let students = await User.aggregate([
            {
              $match:
                {
                  college: {
                    $eq: user.college,
                  },
                  department: {
                    $eq: user.department
                  }
                },
            },
            {
              $addFields: {
                collegeID: {
                  $toObjectId: "$college",
                },
                departmentID: {
                  $toObjectId: "$department",
                },
              },
            },
            {
              $lookup:
                {
                  from: "scoreboardBills",
                  localField: "_id",
                  foreignField: "studentid",
                  as: "record",
                },
            },
            {
              $addFields:
                {
                  department: {
                    $toObjectId: "$department",
                  },
                  college: {
                    $toObjectId: "$college",
                  },
                  departmentID: {
                    $toObjectId: "$department",
                  },
                  collegeID: {
                    $toObjectId: "$college",
                  },
                },
            },
            {
              $lookup:
                {
                  from: "colleges",
                  localField: "college",
                  foreignField: "_id",
                  as: "college",
                },
            },
            {
              $lookup:
                {
                  from: "departments",
                  localField: "department",
                  foreignField: "_id",
                  as: "department",
                },
            },
            {
              $unwind:
                {
                  path: "$department",
                  includeArrayIndex: "0",
                  preserveNullAndEmptyArrays: true,
                },
            },
            {
              $unwind: "$college",
            },
            {
              $project:
                {
                  _id: 1,
                  name: 1,
                  username: 1,
                  role: 1,
                  rollno: 1,
                  college: 1,
                  collegeID: 1,
                  department: 1,
                  departmentID: 1,
                  email: 1,
                  record: 1,
                },
            },
          ])
        return res.json({students:students});
    }
    catch(err) {
        return res.status(500).json({status:"Something went wrong"})
    }
}
