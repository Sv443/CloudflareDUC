const fs = require("fs-extra");
const { resolve } = require("path");

const distPath = resolve("./dist/");


console.log(`\nPreparing for building...`);

// ensure dist folder is empty
if(fs.existsSync(distPath))
    fs.emptyDirSync(distPath);
else
    fs.mkdirSync(distPath);

console.log(`Done preparing for building\n`);
process.exit(0);
