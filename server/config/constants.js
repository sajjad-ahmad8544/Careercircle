const ROLES = {
  "Full Stack Developer": ["JavaScript", "React", "Node", "MongoDB"],
  "Frontend Developer": ["JavaScript", "React"],
  "Backend Developer": ["JavaScript", "Node", "MongoDB"],
};
const BANK = {
  JavaScript: [
    [
      "Which keyword declares a block-scoped variable?",
      ["var", "let", "def"],
      1,
    ],
    ["typeof null returns?", ["null", "object", "undefined"], 1],
    [
      "Which method returns a new transformed array?",
      ["forEach", "map", "push"],
      1,
    ],
  ],
  React: [
    ["Hook used for state?", ["useState", "useFetch", "useDom"], 0],
    ["Lists need which prop?", ["key", "id", "ref"], 0],
    ["useEffect with [] runs?", ["every render", "on mount", "never"], 1],
  ],
  Node: [
    ["Node.js runs on which engine?", ["V8", "SpiderMonkey", "Chakra"], 0],
    ["Module for file system?", ["fs", "http", "os"], 0],
    [
      "npm stands for?",
      ["Node Package Manager", "New Project Maker", "Node Program Module"],
      0,
    ],
  ],
  MongoDB: [
    ["MongoDB stores data as?", ["Tables", "Documents", "Cells"], 1],
    ["Mongoose is a?", ["ODM", "SQL ORM", "Bundler"], 0],
    ["Which method finds documents?", ["find", "select", "get"], 0],
  ],
};

module.exports = { ROLES, BANK };
