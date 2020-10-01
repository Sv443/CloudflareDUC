const scl = require("svcorelib");
const prompts = require("prompts");

const col = scl.colors.fg;
const settings = require("../settings");


/**
 * Displays the main menu
 * @returns {Promise}
 */
function main()
{
    return new Promise(pRes => {

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
        console.log(`It contains ${scl.colors.fat}really${col.rst} important information so please ${scl.colors.fat}actually${col.rst} read it:`);
        console.log(`\n`);

        console.log(`${col.red}DISCLAIMER:${col.rst}`);
        console.log(`${settings.name} will store an API token in the same directory the executable is located in.`);
        console.log(`Please protect this token like a password and do not share it as that might give unwanted people access to your Cloudlfare account!`);
        console.log(`The token will be lightly encrypted so general-purpose scraper malware can't easily grab it but note that skilled people can easily decrypt it if they get a hold of it.`);
        console.log(`To limit the possible amount of damage that could be done, please strictly follow the installation guide as that will ensure the API token only has access to the bare minimum.`);
        console.log(`\n`);

        prompts({
            type: "confirm",
            name: "value",
            message: "Have you read the disclaimer?",
            initial: true
        }).then(res => {
            if(res.value !== true)
            {
                console.log(`\n${col.red}Disclaimer not read / accepted. Exiting process...${col.rst}\n`);
                process.exit(1);
            }

            return pRes();
        });
    });
}

module.exports = { main, firstStart };
