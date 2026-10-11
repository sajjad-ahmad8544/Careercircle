const m = require("mongoose"),
  S = m.Schema,
  id = S.Types.ObjectId;
module.exports = m.model(
  "Job",
  new S(
    {
      title: String,
      company: String,
      type: String,
      skills: [String],
      location: String,
      description: String,
      postedBy: { type: id, ref: "User" },
    },
    { timestamps: true },
  ),
);
