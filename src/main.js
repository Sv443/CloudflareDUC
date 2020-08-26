const config = require("./config");
const xhr = require("./xhr");
const fetchIP = require("./fetchIP");
const crypto = require("./crypto");
const dbg = require("./dbg");
require("dotenv").config();

const settings = require("../settings");


var cfg = {};
var ipv4 = "";
var ipv6 = "";

async function initAll()
{
    if(!config.exists())
        await config.create();

    cfg = await config.load();

    let guiEnabled = true;
    process.argv.forEach(arg => {
        if(arg == "--nogui" || arg == "-n")
            guiEnabled = false;
    });

    if(guiEnabled)
        mainMenu();
    
    fetchLoop();
    setInterval(fetchLoop, settings.fetchLoopInterval * (60 * 1000));
}

function mainMenu()
{
    let records = 0;
    if(Array.isArray(cfg.domains) && cfg.domains.length > 0)
    {
        cfg.domains.forEach(domain => {
            records += domain.records.length;
        });
    }

    console.log(`Supervising ${records} record${records > 1 ? "s" : ""} of ${cfg.domains.length} domain${cfg.domains.length > 1 ? "s" : ""}`);

    // SCL SelectionPrompt
}

/**
 * Should be executed on interval - this retrieves the new IP address of the network
 */
async function fetchLoop()
{
    let aRecords = 0;
    let aaaaRecords = 0;

    cfg.domains.forEach(domain => {
        domain.records.forEach(record => {
            if(record.type == "A")
                aRecords++;
            else if(record.type == "AAAA")
                aaaaRecords++;
        });
    });
    
    if(aRecords > 0)
        ipv4 = await fetchIP("ipv4");

    if(aaaaRecords > 0)
        ipv6 = await fetchIP("ipv6");
    
    dbg("FetchLoop", `Fetched IP: ${ipv4} (v4) / ${ipv6} (v6)`);


    checkRecords();
}

async function checkRecords()
{
    let records = await getRecords();

    console.log(records);
}

function getRecords()
{
    return new Promise((pRes, pRej) => {
        let promises = [];

        cfg.domains.forEach(domain => {
            let zone_id = domain.id;

            let fetchRecordsUrl = `https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`;

            promises.push(new Promise((res) => {
                let records = [];
                let apiKey = crypto.decrypt(cfg.user.apiKey);

                xhr("GET", fetchRecordsUrl, apiKey).then(result => {
                    if(!result.error)
                    {
                        result.data["result"].forEach(record => {
                            if(record.type != "A" && record.type != "AAAA")
                                return;
                            
                            records.push({
                                id: record.id,
                                name: record.name,
                                type: record.type,
                                content: record.content
                            });
                        });

                        return res(records);
                    }
                })
            }));
        });

        Promise.all(promises).then(res => {
            console.log(res);
            return pRes(res);
        }).catch(err => {
            return pRej(err);
        });
    });
}

initAll();
