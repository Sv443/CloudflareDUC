const debuggerActive = typeof v8debug === "object" || /--debug|--inspect/.test(process.execArgv.join(" "));
const nodeWrap = require("node-wrap");
const wHash = require("workspace-hash");


wHash("md5", "hex", {
    excludeFiles: [],
    excludeFolders: [],
    outputFile: "./hash.md5"
}).then(() => {
    init();
}).catch(() => {
    init();
});

function init()
{
    if(debuggerActive !== true) {
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

        return; // not in debugger so return so that the main script doesn't get run twice
    }
    else return require("./main"); // either in debugger or in prod mode, so just run the main script
}

init();