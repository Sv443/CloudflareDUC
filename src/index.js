require('dotenv').config();
const https = require("https");
const http = require("http");
const getMyIP = require('get-my-ip');
const jsl = require("svjsl");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const developerMode = true;
const version = "v0.2 (alpha)";

const errorHandler = require("./errorHandler.js");
const settings = setting = require("./getSettings.js");

const api_token = process.env.CFDUC_TOKEN;
const ca_key = process.env.CFDUC_CAKEY;
const auth_email = process.env.CFDUC_EMAIL;



var shuttingdown = false;
var initPB;

process.on("SIGINT", ()=>errorHandler.exitprompt("keystroke"));
process.on("SIGKILL", ()=>errorHandler.exitprompt("keystroke"));
process.on("SIGTERM", ()=>errorHandler.exitprompt("keystroke"));
process.on("exit", ()=>errorHandler.exitprompt("keystroke"));

if(jsl.isArrayEmpty([api_token, ca_key, auth_email]) !== false) {
    shuttingdown = true;
    errorHandler(601, true, "arr " + jsl.isArrayEmpty([api_token, ca_key, auth_email]));
}

const hostURL = setting.hosturl;
const http_or_https = setting.hostprotocol;

var currentIP;
var needsUpdate = false;
var startupsuccess = 0;
var zone_id = "", dns_identifiers = [], update_urls = [];

process.on('SIGTERM', function(){shuttingdown = true;errorHandler.exitprompt();});
process.on('SIGINT', function(){shuttingdown = true;errorHandler.exitprompt();});

console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n[ \x1b[33m\x1b[1mCloudflare\x1b[0m\x1b[37m\x1b[2mDUC\x1b[0m ]  " + version + "\n");

// console.log("Don't worry if you get a 4xx status, only 5xx statuses will require a DNS update.\n\n");

if(!developerMode) {
    getOwnIP();
    setInterval(()=>getOwnIP, 5000);
}
else {
    console.log("\x1b[33m\x1b[1m[!] \x1b[0mDeveloper Mode is enabled! \x1b[33m\x1b[1m[!]\x1b[0m\n\n");
    currentIP = "2.205.169.80";
}

function getOwnIP() {
    if(!shuttingdown) {
        currentIP = getMyIP();
        if(jsl.isEmpty(currentIP)) {
            shuttingdown=true;
            errorHandler(100, true, "received IP " + currentIP + " /typeof " + typeof currentIP);
        }
    }
}

function initializeAll() {
    initPB = new jsl.ProgressBar(6, "Beginning initialization...");
    setInterval(()=>{
        if(!shuttingdown) {
            //jsl.consoleColor("\nStSc: " + startupsuccess, "bright fgblue");
            if(startupsuccess == 0) init.getID();
            else if(startupsuccess == 1) init.getDNS();
            else if(startupsuccess == 2) init.pingInterval();
            else if(startupsuccess == 3) {progress("\x1b[32m\x1b[1mInitialization complete!\x1b[0m\n\n\n");startupsuccess = 4;if(developerMode) console.log("ZID: " + zone_id + "\nDNS: " + JSON.stringify(dns_identifiers))/*updateRecord();*/}/* TESTING        TESTING        TESTING        TESTING        TESTING        TESTING        TESTING        TESTING        TESTING */
            else if(startupsuccess == 4) {}
            else if(startupsuccess == "err") {
                errorHandler("101", true, "StSc_code: " + startupsuccess + " /typeof " + typeof startupsuccess);
                shuttingdown = true;
            }
            else {
                errorHandler("101", true, "StSc_code: " + startupsuccess + " /typeof " + typeof startupsuccess);
                shuttingdown = true;
            }
        }
    }, settings.timeout * 250);
}

function updateRecord() {
    if(shuttingdown) return;
    if(startupsuccess == 2) startupsuccess = 3;
    console.log("\n\n\x1b[1m\x1b[33m[UPDATE]        \x1b[31mupdating DNS record with API token \x1b[33m[HIDDEN]" + api_token.substring(api_token.length-10) + "\x1b[31m\n                and CA key \x1b[33mv1.0-[HIDDEN]" + ca_key.substring(ca_key.length-10) + " \x1b[31m\n                and email \x1b[33m" + auth_email + "\x1b[31m\n\n                to IP \x1b[34m" + currentIP + "\x1b[0m\n");

    for(let i = 0; i < update_urls.length; i++) {
        var requrl = `https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records/${update_urls[i].id}`;

        var writtenData = JSON.stringify({
            "type": update_urls[i].type,
            "name": update_urls[i].name,
            "content": currentIP,
            "proxied": update_urls[i].proxied,
            "ttl": 1
        });

        var xhr = new XMLHttpRequest();
        xhr.open("PUT", requrl, true);
        xhr.setRequestHeader("X-AUTH-KEY", api_token);
        xhr.setRequestHeader("X-AUTH-USER-SERVICE-KEY", ca_key);
        xhr.setRequestHeader("X-AUTH-EMAIL", auth_email);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = () => {
            if(((xhr.status >= 200 && xhr.status < 300) || xhr.status == 0) && xhr.readyState == 4) {
                try {
                    if(JSON.parse(xhr.responseText).success == true) console.log("\x1b[1m\x1b[33m[UPDATE]\x1b[0m        Successfully updated \"" + update_urls[i].type + "\"-record with name " + update_urls[i].name);
                }
                catch(err) {
                    if(developerMode) console.log("XHRERR: " + err);
                    errorHandler(200, true, "Error: " + err + "\n\nRaw Data:\n" + JSON.stringify(JSON.parse(xhr.responseText), null, 4));
                }
            } else if(xhr.readyState == 4) {
                if(xhr.responseText == "null" || jsl.isEmpty(xhr.responseText)) console.log("\x1b[1m\x1b[33m[UPDATE]\x1b[0m        Error: " + xhr.statusText + " -- " + xhr.responseText);
            }
            else if(xhr.status == 400) {
                errorHandler(202, true, "Status: " + xhr.status + " - Error: " + JSON.stringify(JSON.parse(xhr.responseText).errors, null, 4))
            }
            else {
                if(developerMode) console.log(i + " /RS; " + xhr.readyState + " - " + xhr.status + " - " + xhr.responseText);
            }
        };
        xhr.send(writtenData);
    }
}

const init = {
    getID: () => {
        progress("Retrieving DNS zone identifier");
        let uHOST = "api.cloudflare.com";
        let uPATH = "/client/v4/zones";
        let data = "";
        if(!shuttingdown) {
            https.get({
                headers: {
                    "X-AUTH-KEY": api_token,
                    "X-AUTH-USER-SERVICE-KEY": ca_key,
                    "X-AUTH-EMAIL": auth_email
                },
                hostname: uHOST,
                path: uPATH,
                timeout: settings.timeout
            }, (res) => { 
                // console.log('statusCode: ', res.statusCode);
                
                res.on('data', (d) => {
                    data += d;
                });
            }).on('error', (e) => {
                errorHandler("200", true, "init.getID got error " + e);
                shuttingdown = true;
                startupsuccess = "err";
            }).on('close', ()=> {
                try {
                    zone_id = JSON.parse(data).result[0].id;
                    progress("Done retrieving DNS zone identifiers");
                    // console.log("Zone ID: " + zone_id);
                    startupsuccess = 1;
                }
                catch(err) {
                    errorHandler(200, true, "\n\nError(s):\n\n" + JSON.stringify(JSON.parse(data).errors, null, 4));
                }
            });
        }
    },
    getDNS: () => {
        progress("Retrieving DNS record identifiers");
        let uHOST = "api.cloudflare.com";
        let uPATH = "/client/v4/zones/" + zone_id + "/dns_records";
        let data = "";
        if(!shuttingdown) {
            https.get({
                headers: {
                    "X-AUTH-KEY": api_token,
                    "X-AUTH-USER-SERVICE-KEY": ca_key,
                    "X-AUTH-EMAIL": auth_email
                },
                hostname: uHOST,
                path: uPATH,
                timeout: settings.timeout
            }, (res) => { 
                // console.log('statusCode: ', res.statusCode);
                res.on('data', (d) => {
                    data += d;
                });
            }).on('error', (e) => {
                errorHandler("201", true, "init.getDNS got error " + e);
                shuttingdown = true;
                startupsuccess = "err";
            }).on('close', ()=> {
                try {
                    dns_identifiers = JSON.parse(data).result;
                    progress("Done retrieving DNS record identifiers");
                    for(let i = 0; i < dns_identifiers.length; i++) {
                        startupsuccess = 2;
                        update_urls.push(dns_identifiers[i]);
                    }
                }
                catch(err) {
                    errorHandler(200, true, "\n\nError(s):\n\n" + JSON.stringify(JSON.parse(data).errors, null, 4));
                }
            });
        }
    },
    pingInterval: () => {
        try {
            progress("Initializing ping interval");
            startupsuccess = 3;
            if(!shuttingdown) pingHost();
            setTimeout(()=>{
                if(needsUpdate) updateRecord();
            }, settings.timeout * 1000 + 500);
            setInterval(()=>{
                if(startupsuccess == 4) {
                    if(!shuttingdown) pingHost();
                    setTimeout(()=>{
                        if(needsUpdate) updateRecord();
                    }, settings.timeout * 1000 + 500);
                }
            }, settings.interval * 1000);
        }
        catch(err) {
            errorHandler(300, true, "caught error: " + err);
        }
    }
}

function pingHost() {
    var req, statuscode = "ERR";
    try {
        let url = settings.hosturl, httpver;
        if(url.split("://")[0] == "https") httpver = "https";
        else httpver = "http";

        if(httpver == "https" && !shuttingdown) req = https.get(url, function(res){statuscode = res.statusCode;});
        else if(httpver == "http" && !shuttingdown) req = http.get(url, function(res){statuscode = res.statusCode;});

        setTimeout(function() {
            try {
                let currentDate = timestamp();
                statuscode = parseInt(statuscode);
                if(!shuttingdown) process.stdout.write("\n\x1b[1m" + (statuscode < 400 && statuscode >= 200 ? "\x1b[32m" : (statuscode >= 400 && statuscode < 500 ? "\x1b[33m" : "\x1b[31m")) + "@" + statuscode + "\x1b[0m - ");
                if((!shuttingdown && statuscode >= 500 && statuscode < 600) || (!shuttingdown && isNaN(statuscode))) {needsUpdate = true;process.stdout.write("updating...");}
                else if(!shuttingdown && (statuscode == undefined || statuscode == null)) sendErrorMsg("couldn't get a response from your server. Make sure it is running and publicly accessible!");
                else if(!shuttingdown && statuscode == 200) {process.stdout.write("ok (own IP: \x1b[2m\x1b[33m" + currentIP + "\x1b[0m)  -  " + currentDate);needsUpdate = false;}
                else if(!shuttingdown && statuscode != 200 && statuscode < 500) {process.stdout.write("(not 200 but still ok) - (own IP: \x1b[2m\x1b[33m" + currentIP + "\x1b[0m)  -  " + currentDate);needsUpdate = false;}
                else {}
                process.stdout.write("\x1b[0m");
            }
            catch(err) {
                errorHandler(301, false, "Caught error: " + err);
            }
        }, setting.timeout * 1000);
    }
    catch(err) {
        errorHandler(301, false, "Caught error: " + err);
    }
}

function progress(status) {
    if(!shuttingdown) {
        initPB.next(status);
    }
}





function sendErrorMsg(msg) {
    console.log("\x1b[1m\x1b[31m[ERROR] \x1b[0m" + msg);
}

function timestamp() {
    let d = new Date(), hp = "", mp = "", sp = "", mop = "", dp = "";
    if(d.getHours() < 10) hp = "0";
    if(d.getMinutes() < 10) mp = "0";
    if(d.getSeconds() < 10) sp = "0";
    if(d.getMonth() + 1 < 10) mop = "0";
    if(d.getDate() < 10) dp = "0";
    return "[" + hp + d.getHours() + ":" + mp + d.getMinutes() + ":" + sp + d.getSeconds() + " - " + d.getFullYear() + "." + mop + (d.getMonth() + 1) + "." + dp + d.getDate() + "]";
}
module.exports.timestamp = timestamp;









initializeAll();