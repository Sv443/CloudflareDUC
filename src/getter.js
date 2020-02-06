// this file is dedicated to interacting with the Cloudflare API

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const cfg = require("./loadCfg");
require("dotenv").config();

 



/**
 * Passes the DNS zone identifier in the callback
 * @param {Function} callback 
 */
const zoneIDs = callback => {
    getReq(`https://api.cloudflare.com/client/v4/zones/`, true, (err, res) => {
        let triggeredCB = false;
        if(!err) {
            try {
                if(res.includes("ETIMEDOUT"))
                    return callback(`[Get ZoneIDs] Error: The connection to the Cloudflare API timed out. Make sure your network allows this connection to be established.\nError: ${res}`);
                let rawzones = [];
                JSON.parse(res).result.forEach(zone => rawzones.push(zone));
                rawzones.forEach(zone => {
                    if(zone.name == cfg.settings.domain.toString()) {
                        triggeredCB = true;
                        return callback(null, {
                            id: zone.id,
                            name: zone.name,
                            user: zone.account.name,
                            plan: zone.plan.name
                        });
                    }
                });
            }
            catch(err) {
                return callback(`[Get ZoneIDs] Error while parsing the response from the Cloudflare API: ${err}`);
            }
        }
        else return callback(err);

        if(!triggeredCB) return callback(`Connection to the Cloudflare API was successful but no Cloudflare registered domain was found with the name "${cfg.settings.domain.toString()}".\nPlease check the file "settings.cfg" and make sure you haven't accidentally misspelt it.`);
    });
}

/**
 * Passes all DNS record identifiers as an array in the callback
 * @param {(String|Array<String>)} zoneID The zone identifier from the getZoneID() function
 * @param {Function} callback 
 */
const dnsIDs = (zoneID, callback) => {
    getReq(`https://api.cloudflare.com/client/v4/zones/${zoneID}/dns_records`, true, (err, res) => {
        if(!err) {
            try {
                if(res.includes("ETIMEDOUT"))
                    return callback(`[Get ZoneIDs] Error: The connection to the Cloudflare API timed out. Make sure your network allows this connection to be established.\nError: ${res}`);
                let dnsids = [];
                JSON.parse(res).result.forEach(dnsrecord => dnsids.push({
                    id: dnsrecord.id,
                    type: dnsrecord.type,
                    name: dnsrecord.name,
                    proxied: dnsrecord.proxied
                }));
                callback(null, dnsids);
            }
            catch(err) {
                return callback(`[Get DnsIDs] Error while parsing the response from the Cloudflare API: ${err}`);
            }
        }
        else callback(err);
    });
}

/**
 * Passes all DNS record information in the callback
 * @param {(String|Array<String>)} zoneID The zone identifier from the getZoneID() function
 * @param {Function} callback
 */
const dnsRecords = (zoneID, callback) => {
    getReq(`https://api.cloudflare.com/client/v4/zones/${zoneID}/dns_records`, true, (err, res) => {
        if(!err) {
            try {
                if(res.includes("ETIMEDOUT"))
                    return callback(`[Get ZoneIDs] Error: The connection to the Cloudflare API timed out. Make sure your network allows this connection to be established.\nError: ${res}`);
                res = JSON.parse(res);
                callback(null, res);
            }
            catch(err) {
                return callback(`[Get DnsRecords] Error while parsing the response from the Cloudflare API: ${err}`);
            }
        }
        else callback(err);
    });
}
/**
 * Sends a GET request to the specified URL and returns the result in the callback function
 * @param {String} url 
 * @param {Boolean} provideAuth Whether the API token and account email should be passed aswell
 * @param {Function} callback 
 */
const getReq = (url, provideAuth, callback) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);

    xhr.timeout = parseInt(cfg.settings.defaultTimeout) * 1000;

    if(provideAuth == true) {
        xhr.setRequestHeader("X-Auth-Email", process.env.ACCOUNT_EMAIL);
        xhr.setRequestHeader("X-Auth-Key", process.env.API_KEY);
    }

    xhr.onreadystatechange = () => {
        if(xhr.readyState == 4 && xhr.status < 400) {
            return callback(null, xhr.responseText);
        }
        else if(xhr.readyState == 4 && xhr.status >= 400) {
            return callback(`Couldn't get a response from the Cloudflare API - Response status: ${xhr.status}`);
        }
    }

    xhr.ontimeout = e => {
        return callback(`Couldn't get a response from the Cloudflare API: ${e}`);
    }

    xhr.onerror = e => {
        return callback(`Couldn't get a response from the Cloudflare API: ${e}`);
    }

    xhr.send();
}




module.exports = { zoneIDs, dnsIDs, dnsRecords }
