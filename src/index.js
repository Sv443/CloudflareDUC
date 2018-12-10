require('dotenv').config();
const https = require("https");
const http = require("http");
const publicIp = require('public-ip');
const yesno = require("yesno");
const jsl = require("svjsl");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const version = "v0.1 (alpha)";

const settings = setting = require("./settings.js");

const api_token = process.env.CFDUC_TOKEN;
const ca_key = process.env.CFDUC_CAKEY;
const auth_email = process.env.CFDUC_EMAIL;
const hostURL = setting.hosturl;
const http_or_https = setting.hostprotocol;

var currentIP;
var needsUpdate = false;
var shuttingdown = false;
var startupsuccess = 0;
var zone_id = "", dns_identifiers = [], update_urls = [];

process.on('SIGTERM', function(){shuttingdown = true;softShutdown();});
process.on('SIGINT', function(){shuttingdown = true;softShutdown();});

console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nCloudflareDUC " + version + "\n\n\x1b[32mInitializing script... (this usually takes four seconds)\x1b[0m");
console.log("Don't worry if you get a 4xx status, only 5xx statuses will require a DNS update.\n\n");


initializeAll();


getOwnIP();
setInterval(()=>getOwnIP, 5000);

function getOwnIP() {
    if(!shuttingdown) {
        publicIp.v4().then(ip=>{
            currentIP = ip;
        });
    }
}



function initializeAll() {
    process.stdout.write(".");
    setInterval(()=>{
        if(!shuttingdown) {
            if(startupsuccess == 0) init.getID();
            else if(startupsuccess == 1) init.getDNS();
            else if(startupsuccess == 2) init.pingInterval();
            else if(startupsuccess == 3) {console.log("\x1b[32m\x1b[1mInitialization complete\x1b[0m");startupsuccess = 4;/*updateRecord();*/}/* TESTING        TESTING        TESTING        TESTING        TESTING        TESTING        TESTING        TESTING        TESTING */
            else if(startupsuccess == 4) {}
            else if(startupsuccess == "err"){startupsuccess = "err";console.log("errored");shuttingdown = true;process.exit(1);}
            else {console.log("ERROR - startupsuccess " + startupsuccess + " - please submit an issue on GitHub: https://www.github.com/Sv443/CloudflareDUC");process.exit(1);}
        }
    }, settings.timeout * 500);
}

function updateRecord() {
    if(shuttingdown) return;
    if(startupsuccess == 2) startupsuccess = 3;
    console.log("\n\n\x1b[1m\x1b[33m[UPDATE]        \x1b[31mupdating DNS record with API token \x1b[33m[HIDDEN]" + api_token.substring(api_token.length-10) + "\x1b[31m\n                and CA key \x1b[33mv1.0-[HIDDEN]" + ca_key.substring(ca_key.length-10) + " \x1b[31m\n                and email \x1b[33m" + auth_email + "\x1b[31m\n\n                to IP \x1b[34m" + currentIP + "\x1b[0m\n");

    for(let i = 0; i < update_urls.length; i++) {
        var requrl = `https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records/${update_urls[i].id}/`;

        var writtenData = JSON.stringify({
            "type": update_urls[i].type,
            "name": update_urls[i].name,
            "content": currentIP,
            "proxied": update_urls[i].proxied
        });

        var xhr = new XMLHttpRequest();
        xhr.open("PUT", requrl, true);
        xhr.setRequestHeader("X-AUTH-KEY", api_token);
        xhr.setRequestHeader("X-AUTH-USER-SERVICE-KEY", ca_key);
        xhr.setRequestHeader("X-AUTH-EMAIL", auth_email);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.addEventListener('load', function(e) {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 0) {
                if(JSON.parse(xhr.responseText).success == true) console.log("\x1b[1m\x1b[33m[UPDATE]\x1b[0m        Successfully updated\"" + update_urls[i].type + "\"-record with name " + update_urls[i].name);
            } else {
                if(xhr.responseText == "null" || jsl.isEmpty(xhr.responseText)) console.log("\x1b[1m\x1b[33m[UPDATE]\x1b[0m        ERROR: " + xhr.statusText + " -- " + xhr.responseText);
            }
        });
        xhr.send(writtenData);
    }
}

const init = {
    getID: () => {
        process.stdout.write(".");
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
                console.error("ERROR " + e);
                startupsuccess = "err";
            }).on('close', ()=> {
                zone_id = JSON.parse(data).result[0].id;
                process.stdout.write(".");
                // console.log("Zone ID: " + zone_id);
                startupsuccess = 1;
            });
        }
    },
    getDNS: () => {
        process.stdout.write(".");
        let uHOST = "api.cloudflare.com";
        let uPATH = "/client/v4/zones/" + zone_id + "/dns_records/";
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
                console.error("ERROR " + e);
                startupsuccess = "err";
            }).on('close', ()=> {
                dns_identifiers = JSON.parse(data).result;
                // console.log("DNS ID: " + dns_identifiers);
                process.stdout.write(".");
                for(let i = 0; i < dns_identifiers.length; i++) {
                    startupsuccess = 2;
                    update_urls.push(dns_identifiers[i]);
                }
            });
        }
    },
    pingInterval: () => {
        process.stdout.write(".");
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
            

            // if(!shuttingdown) pingHost(hostURL, http_or_https);
            // if(needsUpdate && !shuttingdown) updateRecord();
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
                statuscode = parseInt(statuscode);
                if(!shuttingdown) process.stdout.write("\n\x1b[1m\x1b[33m@" + statuscode + "\x1b[0m - ");
                if((!shuttingdown && statuscode >= 500 && statuscode < 600) || (!shuttingdown && isNaN(statuscode))) {needsUpdate = true;process.stdout.write("updating...");}
                else if(!shuttingdown && (statuscode == undefined || statuscode == null)) sendErrorMsg("couldn't get a response from your server. Make sure it is running and publicly accessible!");
                else if(!shuttingdown && statuscode == 200) {process.stdout.write("ok (IP: \x1b[2m\x1b[33m" + currentIP + "\x1b[0m)");needsUpdate = false;}
                else if(!shuttingdown && statuscode != 200 && statuscode < 500) {process.stdout.write("ok (but not 200) (IP: \x1b[2m\x1b[33m" + currentIP + "\x1b[0m)");needsUpdate = false;}
                else {}
                process.stdout.write("\x1b[0m");
            }
            catch(err) {
                sendErrorMsg("encountered error while pinging the host: " + err + " - make sure the HOST and HOSTPROTOCOL are correct and your server is running!");
            }
        }, setting.timeout * 1000);
    }
    catch(err) {
        sendErrorMsg("encountered error while pinging the host: " + err + " - make sure the HOST and HOSTPROTOCOL are correct and your server is running!");
    }
}






function sendErrorMsg(msg) {
    console.log("\x1b[1m\x1b[31m[ERROR] \x1b[0m" + msg);
}

function softShutdown() {
    try {
        yesno.onInvalidHandler(function (question, default_value, callback, yes_values, no_values) {
            console.log("\x1b[33m\x1b[1m\nInvalid answer!\nPlease enter either \"\x1b[0mY\x1b[33m\x1b[1m\" to shut down the process or \"\x1b[0mN\x1b[33m\x1b[1m\" to let it keep running.");
            softShutdown();
        });

        yesno.ask("\n\n\n\x1b[33m\x1b[1mShut down? (Y/N):\x1b[0m", false, (result)=>{
            if(result == true) {
                console.log("\n\n\x1b[32m\x1b[1mProcess shut down successfully.\nGoodbye!\x1b[0m\n");
                process.exit();
            }
            else {
                console.log("Shutdown aborted, continuing...\n");
                shuttingdown = false;
            }
        }, ["y", "Y", "yes", "YES", "j", "J", "ja", "JA"], ["n", "N", "no", "NO"]);
    }
    catch(err) {
        process.exit(1);
    }
}