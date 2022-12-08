const fs = require("fs");

const snap = fs.readFileSync("./snapshot/snapshot.json", "utf8");
const snapArray = JSON.parse(snap);
const deduped = snapArray.filter(
  (item, index) => snapArray.indexOf(item) === index
);

const lowercased = deduped.map((item) => item.toLowerCase());

fs.writeFileSync(
  "./snapshot/snapshot-validated.json",
  JSON.stringify(lowercased)
);
