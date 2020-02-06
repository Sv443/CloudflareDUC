const debuggerActive = typeof v8debug === "object" || /--debug|--inspect/.test(process.execArgv.join(" "));
const nodeWrap = require("node-wrap");
// const wHash = require("workspace-hash");
const settings = require("./intsettings");


// wHash("md5", "hex", {
//     excludeFiles: [],
//     excludeFolders: [],
//     outputFile: "./hash.md5"
// }).then(hash => {
//     startWrap();
// }).catch(err => {
//     startWrap();
// });


if(debuggerActive !== true) {
    if(!settings.prodMode) { // not in production mode, enable wrapper
        nodeWrap("./src/main.js", {
            console: true,
            logFile: "./logs/wrapper.log",
            logTimestamp: true,
            crashTimeout: 10000
        }, () => {
            // on start
        }, () => {
            // on crash
        });

        return; // not in debugger and also not in prod mode, so return so that the main script doesn't get run twice
    }
    else require("./main");
}
else require("./main"); // either in debugger or in prod mode, so just run the main script