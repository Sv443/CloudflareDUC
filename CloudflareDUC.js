const debuggerActive = typeof v8debug === "object" || /--debug|--inspect/.test(process.execArgv.join(" "));
const nodeWrap = require("node-wrap");
const wHash = require("workspace-hash");


wHash("md5", "hex", {
    excludeFiles: [],
    excludeFolders: [],
    outputFile: "./integrity.md5"
}).then(() => {
    return init();
}).catch(() => {
    return init();
});

function init()
{
    if(debuggerActive !== true) {
        return nodeWrap("./src/main.js", {
            console: true,
            logFile: "./logs/wrapper.log",
            logTimestamp: true,
            crashTimeout: 10000
        }, () => {
            // on start
        }, () => {
            // on crash
        });
    }
    else return require("./main"); // either in debugger or in prod mode, so just run the main script
}
