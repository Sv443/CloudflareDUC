const fs = require("fs-extra");
const scl = require("svcorelib");
const prompts = require("prompts");

const crypto = require("./crypto");
const xhr = require("./xhr");
const menus = require("./menus");

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
 * @prop {String} user.email
 * @prop {String} user.apiKey
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
    fs.unlinkSync(settings.configPath);
}

async function runPrompts()
{
    return new Promise((res) => {
        let config = {
            createdAt: new Date().getTime(),
            user: {
                email: "",
                apiKey: ""
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
                    await menus.firstStart();

                disclaimerAccepted = true;

                console.clear();
                console.log(`\n`);

                console.log(`You will now be prompted for some data which is necessary to connect to the Cloudflare API.`);
                console.log(`If something is unclear, please refer to the installation guide at ${settings.githubURL}#generating-an-api-token`);
                console.log(`You can press CTRL+C at any time to cancel.`);
                console.log(`\n`);
                
                let rawApiKey = await input(`${col.yellow}What is your API key?${col.rst}`, true);

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
                config.user.apiKey = encrypted;

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
 * Tests if the provided API key has access to the Cloudflare API
 * @param {String} apiKey 
 * @returns {Promise<Boolean | String>}
 */
function apiAccessGranted(apiKey)
{
    return new Promise((pRes) => {
        xhr("GET", "https://api.cloudflare.com/client/v4/zones", apiKey).then(data => {
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

/**
 * Waits for a user to input a string, then resolves promise
 * @param {String} text 
 * @param {Boolean} [masked=false] Set to true to hide input chars
 * @returns {Promise<String>}
 */
function input(text, masked)
{
    return new Promise(pRes => {
        if(typeof masked != "boolean")
            masked = false;

        prompts({
            type: (!masked ? "text" : "password"),
            name: "value",
            message: text,
        }).then(result => {
            return pRes(result.value);
        }).catch(err => {
            scl.unused(err);
            return pRes(null);
        });
    });
}

module.exports = { exists, create, load, remove };
