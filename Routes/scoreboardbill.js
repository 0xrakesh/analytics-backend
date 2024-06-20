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

exports.scores = async(req,res) => {
    try {

        let students = await User.aggregate([
            {
              $addFields:
                /**
                 * newField: The new field name.
                 * expression: The new field expression.
                 */
                {
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
                  localField: "collegeID",
                  foreignField: "_id",
                  as: "college",
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
                  localField: "departmentID",
                  foreignField: "_id",
                  as: "department",
                },
            },
            {
              $unwind: "$college",
            },
            {
              $unwind: "$department",
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
                  from: "StudentScores",
                  localField: "_id",
                  foreignField: "studentid",
                  as: "record",
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
                  path: "$record",
                  includeArrayIndex: "0",
                  preserveNullAndEmptyArrays: true,
                },
            },
            {
              $project:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                  _id: 1,
                  name: 1,
                  username: 1,
                  role: 1,
                  rollno: 1,
                  college: "$college.college",
                  department: "$department.department",
                  year: "$department.year",
                  semester: "$department.semester",
                  section: "$department.section",
                  record: 1,
                  collegeID:1,
                  departmentID:1
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
    console.log("HIII")
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
                $addFields:
                  /**
                   * newField: The new field name.
                   * expression: The new field expression.
                   */
                  {
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
                    localField: "collegeID",
                    foreignField: "_id",
                    as: "college",
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
                    localField: "departmentID",
                    foreignField: "_id",
                    as: "department",
                  },
              },
              {
                $unwind: "$college",
              },
              {
                $unwind: "$department",
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
                    from: "StudentScores",
                    localField: "_id",
                    foreignField: "studentid",
                    as: "record",
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
                    path: "$record",
                    includeArrayIndex: "0",
                    preserveNullAndEmptyArrays: true,
                  },
              },
              {
                $project:
                  /**
                   * specifications: The fields to
                   *   include or exclude.
                   */
                  {
                    _id: 1,
                    name: 1,
                    username: 1,
                    role: 1,
                    rollno: 1,
                    college: "$college.college",
                    department: "$department.department",
                    year: "$department.year",
                    semester: "$department.semester",
                    section: "$department.section",
                    record: 1,
                    collegeID:1,
                    departmentID:1
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
    console.log("Hi")
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
                $addFields:
                  /**
                   * newField: The new field name.
                   * expression: The new field expression.
                   */
                  {
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
                    localField: "collegeID",
                    foreignField: "_id",
                    as: "college",
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
                    localField: "departmentID",
                    foreignField: "_id",
                    as: "department",
                  },
              },
              {
                $unwind: "$college",
              },
              {
                $unwind: "$department",
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
                    from: "StudentScores",
                    localField: "_id",
                    foreignField: "studentid",
                    as: "record",
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
                    path: "$record",
                    includeArrayIndex: "0",
                    preserveNullAndEmptyArrays: true,
                  },
              },
              {
                $project:
                  /**
                   * specifications: The fields to
                   *   include or exclude.
                   */
                  {
                    _id: 1,
                    name: 1,
                    username: 1,
                    role: 1,
                    rollno: 1,
                    college: "$college.college",
                    department: "$department.department",
                    year: "$department.year",
                    semester: "$department.semester",
                    section: "$department.section",
                    record: 1,
                    collegeID:1,
                    departmentID:1
                  },
              },
          ])
        return res.json({students:students});
    }
    catch(err) {
        return res.status(500).json({status:"Something went wrong"})
    }
}
