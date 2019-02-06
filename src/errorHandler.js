const errorRegistry = require("./errorRegistry.js");
const jsl = require("svjsl");
const index = require("./index.js");
var shuttingdown = false;

module.exports = (code, fatal, addInfo) => {
    let errorMessage = errorRegistry[code].message;
    if(jsl.isEmpty(errorMessage)) {
        console.log("\x1b[31m\x1b[1mCouldn't talk to the error registry, please contact me (Sv443) to resolve this issue and provide this info: \x1b[0m\nCode: " + errorMessage + "\nAll:" + JSON.stringify(errorRegistry));
        exitprompt();
    }
    let additionalInfo = "";
    if(!jsl.isEmpty(addInfo)) additionalInfo = "\n\x1b[33mAdditional Info - please include this in an error report: \x1b[0m" + addInfo;

    console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\x1b[31m\x1b[1mGot Error " + code + ":\n\x1b[33m" + errorMessage + additionalInfo + "\n\x1b[0m");
    if(fatal) exitprompt();
}

function exitprompt(event) {
    if(!shuttingdown) {
        shuttingdown = true;
        console.log("\n\n\n" + index.timestamp() + "  \x1b[33m\x1b[1mShutting down" + (event != null ? " (" + event + ")" : "") + ".   \x1b[0m\n");
        process.exit(0);
    }
}
module.exports.exitprompt = exitprompt;