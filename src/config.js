const fs = require("fs-extra");
const scl = require("svcorelib");
const crypto = require("./crypto");
const readline = require("readline");

const rl = readline.createInterface(process.stdin, process.stdout);

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
    return fs.existsSync("./.config.json");
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
    return JSON.parse(fs.readFileSync("./.config.json").toString());
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

        if(!process.stdin || !process.stdin.isTTY)
        {
            console.log(`${col.red}\nTerminal can't be read from or doesn't have a stdin channel.${col.rst}\n\n`);
            process.exit(1);
        }

        process.stdin.setRawMode(true);

        try
        {
            (async () => {
                clearConsole();

                config.user.email = await input("Enter your account's E-Mail address:");
                
                let rawApiKey = await input("Enter your API key:");
                let encrypted = await crypto.encrypt(rawApiKey);
                config.user.apiKey = encrypted;

                fs.writeFileSync("./.config.json", JSON.stringify(config, null, 4));

                return res();
            })();
        }
        catch(err)
        {
            console.log(`${col.red}\nThere was an error while creating the config file: ${err}${col.rst}\n\n`);
            process.exit(1);
        }
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
 * @returns {Promise<String>}
 */
function input(text)
{
    return new Promise(res => {
        rl.resume();
        rl.question(`${text} `, ans => {
            rl.pause();
            
            return res(ans.toString().trim());
        });
    });
}

module.exports = { exists, create, load };
