// const scl = require("svcorelib");
// const nodeWrap = require("node-wrap");
// const { resolve } = require("path");
// const fs = require("fs-extra");

// require("dotenv").config();

// const settings = require("./settings");


// if(!scl.inDebugger())
// {
//     settings.init.ensureDirectories.forEach(dir => {
//         let path = resolve(dir);

//         if(!fs.existsSync(path))
//             fs.mkdirSync(path);
//     });

//     nodeWrap("./src/main.js", {
//         console: true,
//         logFile: "./logs/wrapper.log",
//         logTimestamp: true,
//         crashTimeout: 10000
//     }, () => {
//         // on start
//     }, () => {
//         // on crash
//     });
// }
// else
require("./src/main");
