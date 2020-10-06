const fs = require("fs-extra");
const scl = require("svcorelib");
const prompts = require("prompts");

const crypto = require("./crypto");
const xhr = require("./xhr");
const input = require("./input");

const settings = require("../settings");

const col = scl.colors.fg;


/**
 * @typedef {Object} DnsRecord
 * @prop {"A"|"AAAA"} type
 * @prop {String} id
 */

/**
 * @typedef {Object} DnsDomain
 * @prop {String} id
 * @prop {String} name
 * @prop {Array<DnsRecord>} records
 */

/**
 * @typedef {Object} UserConfigObj
 * @prop {Number} createdAt
 * @prop {Object} user
 * @prop {String} user.apiToken
 * @prop {Array<DnsDomain>} domains
 */


/**
 * Tests whether or not the config file exists
 * @returns {Boolean}
 */
function exists()
{
    return fs.existsSync(settings.configPath);
}

/**
 * Runs through a few prompts to create the config file
 * @returns {Promise}
 */
function create()
{
    return new Promise((res) => {
        remove();
        runPrompts().then(() => res());
    });
}

/**
 * Loads the config file and returns it
 * @returns {UserConfigObj}
 */
function load()
{
    return JSON.parse(fs.readFileSync(settings.configPath).toString());
}

/**
 * Deletes the config file
 * @returns {void}
 */
function remove()
{
    if(fs.existsSync(settings.configPath))
        fs.unlinkSync(settings.configPath);
}

async function runPrompts()
{
    return new Promise((res) => {
        let config = {
            createdAt: new Date().getTime(),
            user: {
                apiToken: ""
            },
            domains: []
        };

        process.stdout.write(col.rst);

        if(!process.stdin || !process.stdin.isTTY)
        {
            console.log(`${col.red}\nTerminal can't be read from or doesn't have a stdin channel.${col.rst}\n\n`);
            process.exit(1);
        }

        process.stdin.setRawMode(true);

        try
        {
            let disclaimerAccepted = false;

            let firstStartProc = async () => {
                clearConsole();

                if(!disclaimerAccepted)
                    await firstStart();

                disclaimerAccepted = true;

                console.clear();
                console.log(`\n`);

                console.log(`You will now be prompted for some data which is necessary to connect to the Cloudflare API.`);
                console.log(`If something is unclear, please refer to the installation guide at ${settings.githubURL}#generating-an-api-token`);
                console.log(`You can press CTRL+C at any time to cancel.`);
                console.log(`\n`);
                
                let rawApiKey = await input(`${col.yellow}What is your API token?${col.rst}`, true);

                if(rawApiKey === undefined)
                    process.exit(0);

                process.stdout.write("\n\n\n");
                process.stdout.write("Validating...");

                let dataValid = await apiAccessGranted(rawApiKey);

                process.stdout.cursorTo(0);
                process.stdout.write("             ");
                process.stdout.cursorTo(0);
                
                if(typeof dataValid == "string")
                {
                    process.stdout.write(`${col.red}Error:${col.rst}\n${dataValid}.\nIf you need help, please refer to the installation guide at ${settings.githubURL}#generating-an-api-token\n\n`);

                    await scl.pause("Press any key to try again...");
                    return firstStartProc();
                }

                process.stdout.write(`${col.green}Success!${col.rst}\n\n`);

                let encrypted = await crypto.encrypt(rawApiKey);
                config.user.apiToken = encrypted;

                await scl.pause(`Press any key to confirm the data and continue to the main menu...`);
                
                fs.writeFileSync("./.config.json", JSON.stringify(config, null, 4));

                return res();
            };

            firstStartProc();
        }
        catch(err)
        {
            console.log(`${col.red}\nThere was an error while creating the config file: ${err}${col.rst}\n\n`);
            process.exit(1);
        }
    });
}

/**
 * Displays the first start text and asks to confirm the disclaimer
 * @returns {Promise}
 */
function firstStart()
{
    return new Promise(pRes => {
        console.log(`${col.green}Hello!${col.rst}`);
        console.log(`This seems to be the first time you are starting ${settings.name} (or you have deleted the config file)`);
        console.log(`The following disclaimer contains ${scl.colors.fat}really${col.rst} important information so please ${scl.colors.fat}actually${col.rst} read it:`);
        console.log(`\n`);

        console.log(`${col.red}DISCLAIMER:${col.rst}`);
        console.log(`${settings.name} will store an API token in the same directory the executable is located in.`);
        console.log(`Please protect this token like a password and do not share it as that might give unwanted people access to your Cloudflare account!`);
        console.log(`The token will be lightly encrypted so general-purpose scraper malware can't easily grab it but note that skilled people can easily decrypt it if they get a hold of it.`);
        console.log(`To limit the possible amount of damage that could be done, please strictly follow the installation guide as that will ensure the API token only has access to the bare minimum.`);
        console.log(`\n`);

        prompts({
            type: "confirm",
            name: "value",
            message: "Have you read the disclaimer and accept the risks?",
            initial: true
        }).then(res => {
            if(res.value !== true)
            {
                console.log(`\n${col.red}Disclaimer not read or not accepted. Exiting...${col.rst}\n`);
                process.exit(1);
            }

            return pRes();
        });
    });
}

/**
 * Tests if the provided API key has access to the Cloudflare API
 * @param {String} apiToken 
 * @returns {Promise<Boolean | String>}
 */
function apiAccessGranted(apiToken)
{
    return new Promise((pRes) => {
        xhr("GET", "https://api.cloudflare.com/client/v4/zones", apiToken).then(data => {
            if(data.status == 200)
                return pRes(true);
            else if(data.status == 403)
                return pRes("This API token doesn't exist or doesn't have the correct access permissions");
            else if(data.status == 400)
                return pRes("Entered text is not a valid Cloudflare API token");
            else if(data.status == 429)
                return pRes("You were doing this too much and the Cloudflare API has temporarily blocked you. Please try again in about an hour.");
            else
                return pRes(`Unknown error - status: ${data.status} - err1: [${data.data.errors[0].code}] ${data.data.errors[0].message}`);
        });
    });
}

function clearConsole()
{
    try
    {
        if(console && console.clear && process.stdout && process.stdout.isTTY)
            console.clear();
        else if(console)
            console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
        else
            process.stdout.write("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
    }
    catch(err) // this might be overkill but eh ¯\_(ツ)_/¯
    {
        return;
    }
}

module.exports = { exists, create, load, remove };
