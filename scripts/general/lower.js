const fs = require("fs")
let res = []

// lowercase every string in array
const lowercase = arr => {
  return arr.map(item => item.toLowerCase())
}

// dedupe array
const dedupe = arr => {
  return [...new Set(arr)]
}

fs.writeFileSync("snap.json", JSON.stringify(dedupe(lowercase(res))))
