const config = require("./config");
// const xhr = require("./xhr");
const fetchIP = require("./fetchIP");
// const crypto = require("./crypto");
const dbg = require("./dbg");
const menus = require("./menus");
const api = require("./api");

const scl = require("svcorelib");
require("dotenv").config();

const col = scl.colors.fg;
const settings = require("../settings");


var cfg = {};
var ipv4 = "";
var ipv6 = "";
var guiEnabled = true;

async function initAll()
{
    if(!config.exists())
        await config.create();

    cfg = await config.load();

    let errored = false;

    try
    {
        await api.init(cfg.user.apiToken);
    }
    catch(err)
    {
        errored = true;

        let countdown = settings.restartInterval;
        let countdownIv = setInterval(() => {
            let logMsgs = [];
            
            console.clear();

            logMsgs.push(`\n${col.red}No Internet Connection or Cloudflare API is down${col.rst}`);
            logMsgs.push(`You either don't have an internet connection or the Cloudflare API couldn't be reached.\n`);
            logMsgs.push(`${settings.name} will retry the connection in ${col.yellow}${countdown}${col.rst} seconds...`);
            logMsgs.push(`\n`);

            process.stdout.write(logMsgs.join("\n"));

            countdown--;

            if(countdown < 0)
            {
                clearInterval(countdownIv);
                return initAll();
            }
        }, 1000);
    }

    if(errored)
        return;

    process.argv.forEach(arg => {
        if(arg == "--nogui" || arg == "-n")
            guiEnabled = false;
    });

    if(guiEnabled)
        menus.main();
    else
        console.log(`\n\n${col.green}${settings.name} v${settings.version} - ready${col.rst}\n`);
    
    fetchLoop();
    setInterval(fetchLoop, settings.fetchLoopInterval * (60 * 1000));
}

/**
 * Should be executed on interval - this retrieves the new IP address of the network
 */
async function fetchLoop()
{
    let aRecords = 0;
    let a4Records = 0;

    cfg.domains.forEach(domain => {
        domain.records.forEach(record => {
            if(record.type == "A")
                aRecords++;
            else if(record.type == "AAAA")
                a4Records++;
        });
    });
    
    if(aRecords > 0)
        ipv4 = await fetchIP("ipv4");

    if(a4Records > 0)
        ipv6 = await fetchIP("ipv6");

    if(aRecords == 0 && a4Records == 0)
    {
        if(!guiEnabled)
        {
            console.log(`${col.red}No updatable records were found${col.rst}`);
            console.log(`Please start ${settings.name} without the ${col.yellow}--nogui${col.rst} or ${col.yellow}-n${col.rst} argument and configure the record(s) you want to be updated\n`);
            
            process.exit(1);
        }

        dbg("FetchLoop", `No records found - not fetching IP`);
    }
    else
        dbg("FetchLoop", `Fetched IP: ${ipv4} (v4) / ${ipv6} (v6)`);

    checkRecords();
}

/**
 * Gets all records and checks if they should be updated
 */
async function checkRecords()
{
    let records = await api.getAllRecords();

    dbg("ChkRecords", `Records found: ${records ? records.length : "none"}`);
}

// /**
//  * Calls the Cloudflare API and returns all the records of the domains specified in the config file
//  * @returns {Promise<Object>}
//  */
// function getRecords()
// {
//     return new Promise((pRes, pRej) => {
//         let promises = [];

//         cfg.domains.forEach(domain => {
//             let zone_id = domain.id;

//             // let fetchRecordsUrl = `https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`;

//             // promises.push(new Promise((res) => {
//             //     let records = [];
//             //     let apiToken = crypto.decrypt(cfg.user.apiToken);

//             //     xhr("GET", fetchRecordsUrl, apiToken).then(result => {
//             //         if(!result.error)
//             //         {
//             //             result.data["result"].forEach(record => {
//             //                 if(record.type != "A" && record.type != "AAAA")
//             //                     return;
                            
//             //                 records.push({
//             //                     id: record.id,
//             //                     name: record.name,
//             //                     type: record.type,
//             //                     content: record.content
//             //                 });
//             //             });

//             //             return res(records);
//             //         }
//             //     })
//             // }));
//         });

//         Promise.all(promises).then(res => {
//             console.log(res);
//             return pRes(res);
//         }).catch(err => {
//             return pRej(err);
//         });
//     });
// }

module.exports = { initAll };
