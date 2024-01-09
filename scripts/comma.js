// will add a comma to the end of every line in the file

var fs = require("fs")
var path = require("path")

var file = process.argv[2]

fs.readFile(file, "utf8", function (err, data) {
  if (err) throw err
  var lines = data.split("\n")
  var newLines = lines.map(function (line) {
    return line + ","
  })
  var newFile = newLines.join("\n")

  fs.writeFile(file, newFile, function (err) {
    if (err) throw err
  })
})
