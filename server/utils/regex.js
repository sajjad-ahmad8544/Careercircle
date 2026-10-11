// escape user input before it goes into new RegExp(...) (so "C++" or "node.js" don't crash the query)
exports.esc = (s) => String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");