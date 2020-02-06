const debuggerActive = typeof v8debug === "object" || /--debug|--inspect/.test(process.execArgv.join(" "));
const settings = require("./intsettings"); // internal settings file that is just a centralized way of storing developer-only settings

const jsl = require("svjsl"); // one of my own libraries that does miscellaneous stuff
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; // implements XHR's as defined in the W3C spec
const hasInternet = require("internet-available");

const get = require("./getter"); // central module for all "get events" like getting the DNS IDs
const cfg = require("./loadCfg"); // loads in the config file and converts it into a JSON object
const logger = require("./logger"); // logs information to a .log file
const parseBool = require("./parseBool"); // convert a variable to a boolean value
const getDate = require("./getDate") // gets the current date in a formatted string

require("dotenv").config();

if(process.env.GLOBAL_API_KEY != null || process.env.GLOBAL_API_KEY != undefined) {
    console.log(`Your .env file still has the old format from before CB_05. Please delete the file so the program can re-generate it with the correct format.`);
    process.exit(0);
}

var ip = "";
var recordsToUpdate = [];
var zoneID = "";






console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");

var initPB;
if(debuggerActive !== true) initPB = new jsl.ProgressBar(7, "Checking internet connection...");


//#MARKER Init
/**
 * Initialize everything
 */
const initAll = () => {
    try {
        hasInternet().then(() => {
            if(debuggerActive !== true) initPB.next("Verifying config files...");
            if(settings.verboseLogging) console.log(`\n\n\x1b[33m\x1b[1m[initAll]\x1b[0m initializing all...`);
            if(cfg.verifyCfgFiles()) { // check if .env and settings.cfg exist and create them if not
                if(debuggerActive !== true) initPB.next("Reading config file...");
                cfg.init().then(()=>{ // read the settings.cfg file and create a JSON object out of it
                    if(debuggerActive !== true) initPB.next("Starting get-IP-loop...");
                    getIPloop(); // start the loop that fetches the own network's public IP
                    if(settings.verboseLogging) console.log(`\n\n\x1b[32m\x1b[1m[Config]\x1b[0m initialized`);
                    if(debuggerActive !== true) initPB.next("Getting zone IDs...");
                    get.zoneIDs((err, zidres) => { // get all DNS zone IDs from the Cloudflare API
                        if(err != null || zidres == undefined) {
                            // got error response from CF API

                            console.log(`\n\n\x1b[33m\x1b[1m${err}\n\nPlease check whether your login information in the ".env" file is correct if you keep getting this error.\nThis window will automatically close after 20 seconds.\n\n\x1b[0m`);
                            process.exit(1);
                            return;
                        }
                        else if(err == null) {
                            zoneID = zidres.id;

                            if(settings.verboseLogging) console.log(`\n\n\x1b[32m\x1b[1m[Get]\x1b[0m got Zone ID`); 
                            if(!err) {
                                if(debuggerActive !== true) initPB.next("Getting DNS IDs...");
                                get.dnsIDs(zoneID, (err, res) => { // get all DNS IDs from the Cloudflare API
                                    recordsToUpdate = res;

                                    // 2019-07-04 | #17 | Remove all records that aren't of type A or AAAA
                                    recordsToUpdate.forEach((record, i) => {
                                        if(record.type != "A" && record.type != "AAAA") recordsToUpdate.splice(i, 1);
                                    });
                                    
                                    if(settings.verboseLogging) console.log(`\n\n\x1b[32m\x1b[1m[Get]\x1b[0m got DNS IDs`); 
                                    if(!err) {
                                        if(debuggerActive !== true) initPB.next("Starting ping loop...");
                                        startCheckLoop(); // starting DNS check loop

                                        // done

                                        if(debuggerActive !== true) initPB.next(`\x1b[32m\x1b[1mDone initializing CloudflareDUC (${settings.versionFull})\x1b[0m\n\x1b[36m\x1b[1mYou can just let this process run in the background and everything will be done for you, ${zidres.user}!\x1b[0m`);
                                        console.log(`\x1b[36m\x1b[1mCloudflareDUC will keep all DNS records for the page \x1b[33m\x1b[1m${zidres.name}\x1b[0m\x1b[36m\x1b[1m (Plan: \x1b[33m\x1b[1m${zidres.plan}\x1b[0m\x1b[36m\x1b[1m) up to date.\x1b[0m\n\n`);

                                        if(settings.verboseLogging) console.log(`\n\n\x1b[32m\x1b[1m[initAll]\x1b[0m done initializing\n- zid: ${zoneID}\n- res:\n${JSON.stringify(res, null, 4)}`); 
                                    }
                                    else {
                                        // err while getting DNS IDs
                                        return initError("getting DNS IDs", err);
                                    }
                                });
                            }
                            else {
                                // err while getting zone ID
                                return initError("getting zone ID", err);
                            }
                        }
                    });
                }).catch(err => {
                    return initError("reading the settings.cfg file", err);
                });
            }
        }).catch(() => {
            return initError("checking internet connection", "A connection to the internet couldn't be established, please check your internet connection and restart CloudflareDUC.\nAlso check whether a firewall, proxy or group policy is blocking the requests from CloudflareDUC.")
        });
    }
    catch(err) {
        return initError("initializing (general error)", err);
    }
}

/**
 * Error while initializing
 * @param {String} title 
 * @param {String} desc 
 */
const initError = (title, desc) => {
    console.log(`\n\x1b[31m\x1b[1m[Error] \x1b[0mEncountered an error while ${title}.\nDetailed error message:\n${desc}\n\n`);
    logger("startupError", `Error while initializing (Error while ${title})`, desc);
    process.exit(1);
    return true;
};

// 2019-07-23 | #18 | general error catcher for XHRs
/**
 * Sends an error message (on failed IP get)
 * @param {String} err
 */
const getIpError = err => {
    initError("fetching your public IP", `Error message: ${typeof err == "string" ? err : ""}`);
    if(typeof err != "string") console.log(`GetIP - Error: ${err}`);
}

//#MARKER Get IP
/**
 * Updates the own device's public IP address on a set interval
 */
const getIPloop = () => {
    try {
        if(settings.verboseLogging) console.log(`\n\n\x1b[32m\x1b[1m[IPloop]\x1b[0m initialized`);

        let backupIPXHR = (firstXHR) => { // backup request for when the primary one fails
            let backupxhr = new XMLHttpRequest();
            backupxhr.open("GET", settings.ipProviderBackup, true);
            backupxhr.timeout = parseInt(cfg.settings.defaultTimeout) * 1000;
            backupxhr.onreadystatechange = () => {
                if(backupxhr.readyState == 4 && backupxhr.status < 400) {
                    // no err

                    try {
                        let respText = backupxhr.responseText;
                        ip = typeof respText == "string" ? respText : respText.toString(); // parse the IP from the response - this provider doesn't return a JSON object but instead just a string
                        if(!jsl.isEmpty(settings.bypassIP)) ip = settings.bypassIP;
                        module.exports.ip = ip;
                    }
                    catch(err) {
                        if(err.includes(".toString()")) return getIpError(`Wrong IP type, couldn't convert it into a string.\nExpected: "string" - got: "${typeof backupxhr.responseText}"`);
                        else return getIpError(`Wrong IP type.\nExpected: "string" - got: "${typeof respText}"`);
                    }
                }
                else if(backupxhr.readyState == 4 && backupxhr.status >= 400) {
                    // err
                    return initError("fetching your public IP", `Main IP provider returned status ${firstXHR.status}\nBackup IP provider returned status ${backupxhr.status}`);
                }
            };

            backupxhr.ontimeout = e => getIpError(`XHR ETIMEDOUT: ${e}`);
        
            backupxhr.onerror = e => getIpError(`XHR general error: ${e}`);

            backupxhr.send();
        };

        let gip = () => {
            try {
                let xhr = new XMLHttpRequest(); // primary request
                xhr.open("GET", settings.ipProvider, true);
                xhr.onreadystatechange = () => {
                    if(xhr.readyState == 4 && xhr.status < 300) {
                        // no err

                        // 2019-07-04 | #15 | try-catch to catch errors, MIME type checking
                        // 2019-07-23 | #18 | even more error handling, even more verbose MIME type checking
                        let mimeType = "";
                        try {
                            try {
                                mimeType = xhr.getResponseHeader("content-type");
                            }
                            catch(err) {
                                mimeType = "ERROR/no_contenttype_header_found";
                            }

                            if(typeof mimeType != "string")
                                mimeType = "ERROR/invalid_mime_type";

                            if(!mimeType.includes("json"))
                                return backupIPXHR();
                            else
                            {
                                ip = JSON.parse(xhr.responseText).ip; // get the IP from the response
                                if(!jsl.isEmpty(settings.bypassIP))
                                    ip = settings.bypassIP;
                                module.exports.ip = ip;
                            }
                        }
                        catch(err) {
                            console.log(`\x1b[33m\x1b[1mError while retrieving own IP address (${err})\nGot MIME type "${mimeType}", expected "application/json" instead.\nRetrying after 3s...\x1b[0m\n`);
                            return setTimeout(() => gip(), 3000);
                        }
                    }
                    else if(xhr.readyState == 4 && xhr.status >= 400) {
                        // err while getting IP
                        // try backup IP provider

                        xhr.abort();
                        backupIPXHR(xhr);
                    }
                };
                
                xhr.ontimeout = e => getIpError(`XHR ETIMEDOUT: ${e}`);
            
                xhr.onerror = e => getIpError(`XHR general error: ${e}`);

                xhr.send();
            }
            catch(err) {
                if(settings.verboseLogging) console.log(`\n\n\x1b[31m\x1b[1m[IPloop]\x1b[0m Error: ${err}`);
            }
        };

        gip();
        setInterval(() => {
            gip();
        }, 10 * 1000);
    }
    catch(err) {
        if(settings.verboseLogging) console.log(`\n\n\x1b[31m\x1b[1m[IPloop]\x1b[0m Error: ${err}`);
        return initError("fetching your public IP", `Error: ${err}`);
    }
}

//#MARKER CheckLoop
/**
 * Starts the check loop which checks the DNS record(s) on interval and causes the actual DNS update
 */
const startCheckLoop = () => {
    // GET https://api.cloudflare.com/client/v4/zones/[ZONE_ID]/dns_records

    if(settings.verboseLogging) console.log(`\n\n\x1b[33m\x1b[1m[CheckLoop]\x1b[0m starting...`);

    try {
        let dnsCheckApiCall = () => {
            get.dnsRecords(zoneID, (err, res) => {
                if(!err)
                {
                    if(jsl.isEmpty(res))
                    throw new Error(`Error while checking DNS records: API call result is invalid: "${res}"`);
                
                    if(typeof res != "object")
                        res = JSON.parse(res);

                    let records = [];

                    res.result.forEach(record => { // construct a better usable object from all type "A" records
                        if(record.type == "A")
                            records.push({
                                id: record.id,
                                type: record.type,
                                zoneID: record.zone_id,
                                name: record.name,
                                content: record.content,
                                proxied: record.proxied,
                                ttl: record.ttl,
                                oldIP: record.content,
                                newIP: ip
                            });
                    });

                    records.forEach(rec => {
                        if(rec.content != ip)
                        {
                            if(settings.verboseLogging)
                                console.log(`Updating record "${rec.name}" - had IP: "${rec.oldIP}" - to IP: "${rec.newIP}"`);
                            updateRecord(rec);
                        }
                        else if(settings.verboseLogging)
                            console.log(`No need to update record "${rec.name}" - has IP: "${rec.oldIP}" - current public IP: "${rec.newIP}"`);
                    });
                }
                else
                    throw new Error(`Error while getting DNS records: ${err}`);
            });
        };

        const checkLoopInterval = setInterval(() => dnsCheckApiCall(), parseInt(settings.checkInterval) * 1000);
        jsl.unused(checkLoopInterval);
        dnsCheckApiCall();
    }
    catch(err)
    {
        console.log(`Error while checking DNS records: ${err}`);
    }
}

//#MARKER Update Record
const updateRecord = record => {
    // PUT https://api.cloudflare.com/client/v4/zones/[ZONE_ID]/dns_records/[DNS_ID]

    let updateXHR = new XMLHttpRequest();
    updateXHR.open("PUT", `https://api.cloudflare.com/client/v4/zones/${zoneID}/dns_records/${record.id}`);

    updateXHR.setRequestHeader("X-Auth-Email", process.env.ACCOUNT_EMAIL.toString());
    updateXHR.setRequestHeader("X-Auth-Key", process.env.API_KEY.toString());
    updateXHR.setRequestHeader("Content-Type", "application/json");

    updateXHR.onreadystatechange = () => {
        if(updateXHR.readyState == 4 && updateXHR.status < 300)
            console.log(`${getDate()}  -  ${jsl.colors.fg.green}Successfully updated record with name "${record.name}"${parseBool(cfg.settings.showOwnIP) ? ` to IP "${record.newIP}"` : ""}${jsl.colors.rst}`);
        else if(updateXHR.readyState == 4 && updateXHR.status >= 300)
        {
            let errors = [];
            JSON.parse(updateXHR.responseText).errors.forEach(updError => errors.push(updError.message));
            console.log(`${getDate()}  -  ${jsl.colors.fg.red}Error while updating record with name "${record.name}" - HTTP status: ${updateXHR.status} - Error${errors.length == 1 ? "" : "s"}: ${errors.join(", ")}${jsl.colors.rst}`);
        }
    }

    let updateData = JSON.stringify({
        "type": record.type,
        "name": record.name,
        "content": record.newIP,
        "proxied": record.proxied,
        "ttl": record.ttl
    });

    updateXHR.send(updateData);
}




initAll(); // initialize everything after all variables have been registered
