const nodeWrap = require("node-wrap");
const whash = require("workspace-hash");

const whopts = {
    algorithm: "md5",
    digest: "hex"
};

whash(whopts.algorithm, whopts.digest, {
    outputFile: "../integrity." + whopts.algorithm,
    excludeFiles: ["settings.cfg", "wrapper.log", "error.log", ".env"]
}).then(result => {
    console.log("\x1b[32m\x1b[1m[workspace-hash]\x1b[0m:  (" + whopts.algorithm + "/" + whopts.digest + ": " + result + ")");
});

nodeWrap("./index.js", {
    console: true,
    crashTimeout: 3000,
    logTimestamp: true,
    logFile: "./wrapper.log",
    bootLoopDetection: 6000
});