const fs = require("fs");
let o = JSON.parse(fs.readFileSync("snapshot-old.json"))
let n = JSON.parse(fs.readFileSync("snapshot-new.json"))
let combined = o.concat(n)


// lowercase every string in array
const lowercase = (arr) => {
  return arr.map((item) => item.toLowerCase());
};

// dedupe array
const dedupe = (arr) => {
  return [...new Set(arr)];
};

const final = dedupe(lowercase(combined));
console.log(`Len: ${final.length}`);
fs.writeFileSync("snapshot.json", JSON.stringify(final));
