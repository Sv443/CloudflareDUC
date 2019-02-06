/*module.exports = {
    "hosturl": "https://www.sv443.net/index.html",    //the URL/IP of the host that will be pinged. This is used to look up your IP address. Don't use your local IP!
    "hostprotocol": "https",                          //the protocol your domain uses (can be "http" or "https") - if you use an IP, please use "http"
    "ipversion": "v4",                                //the version of your IP address that you normally use in the DNS record (can be "v4" (default) or "v6")
    "interval": 4,    //interval in seconds at which the host will be pinged (your server, not cloudflare) - set to higher value to save bandwidth but also increase net downtime
    "timeout": 2       //timeout of the ping (in seconds)
}*/

const fs = require("fs");
const jsl = require("svjsl");
const errorHandler = require("./errorHandler.js");

var verified = false;

let xy;
try {
    xy = fs.readFileSync("./settings.cfg");
}
catch(err) {
    errorHandler(600, true, err);
}
if(jsl.isEmpty(xy.toString())) {console.log("\x1b[31m\x1b[1mThe settings couldn't be found! Please make sure you haven't accidentally deleted or renamed the settings.cfg file and optionally re-download the script\x1b[0m");process.exit(1);}
xy = xy.toString().split("\n");
let done = [];
let result = {};

for(let i = 0; i < xy.length; i++) {
    done.push(xy[i].split("#")[0].trim());
}

for(let i = 0; i < done.length; i++) {
    if(!isNaN(parseInt(done[i].split("=")[1]))) result[done[i].split("=")[0]] = parseInt(done[i].split("=")[1]);
    else result[done[i].split("=")[0]] = done[i].split("=")[1];
}




let isComplete = false;
if(typeof result.hosturl == "string" && typeof result.interval == "number" && typeof result.timeout == "number" && typeof result.verification == "string") isComplete = true;

if(result.verification == "l556" && isComplete) verified = true;
else if(!isComplete){ verified = false; errorHandler(501, true, "/typesof " + typeof result.hosturl == "string" + typeof result.interval == "number" + typeof result.timeout == "number" + typeof result.verification == "string");}
else verified = false;




if(verified) module.exports = result;
else errorHandler(500, true);