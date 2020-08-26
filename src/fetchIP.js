// const scl = require("svcorelib");
const isIP = require("is-ip");

const xhr = require("./xhr");


/**
 * Fetches the current network's public IP address
 * @param {"ipv4"|"ipv6"} ipVer 
 * @returns {Promise<String|null>} Returns `null` if the IP couldn't be fetched
 */
function fetchIP(ipVer)
{
    let ip = "";

    return new Promise((res, rej) => {
        (async () => {
            ip = await fetchFrom("ipify", ipVer);

            if(ip == null || !isIP(ip))
                ip = await fetchFrom("ifconfig", ipVer);

            if(!isIP(ip))
                return rej(`Error: couldn't fetch your public IP address. Retrying on next interval call...`);

            return res(ip);
        })();
    });
}

// ipify
// https://api.ipify.org?format=json

// ifconfig
// https://ifconfig.co/json

/**
 * Fetches the IP from a certain site, resolving a promise with the IP or rejecting with a status code
 * @param {"ipify"|"ifconfig"} site 
 * @param {"ipv4"|"ipv6"} ipVer 
 * @returns {Promise<String, Number>}
 */
async function fetchFrom(site)
{
    let url = "";

    if(site == "ipify")
        url = "https://api.ipify.org?format=json";
    else if(site == "ifconfig")
        url = "https://ifconfig.co/json";
    else
        throw new Error(`Wrong site name "${site}" specified in "fetchIP.fetchFrom()"`);

    try
    {
        let result = await xhr("GET", url);

        if(site == "ipify" || site == "ifconfig")
            return result.data["ip"];
    }
    catch(err)
    {
        console.log(`Error while fetching IP: ${err}`);
        return null;
    }
}

module.exports = fetchIP;
