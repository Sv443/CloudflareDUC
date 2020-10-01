const scl = require("svcorelib");
const prompts = require("prompts");

const config = require("./config");

const col = scl.colors.fg;
const settings = require("../settings");


/**
 * Displays the main menu
 * @returns {Promise}
 */
function main()
{
    return new Promise(pRes => {
        scl.unused(pRes);
        // SCL SelectionMenu
        let sm = new scl.SelectionMenu(`${settings.name} - Main Menu:`, { cancelable: false });

        sm.setOptions([
            "Live Monitor",
            "Info View",
            "Modify Configuration",
            "Exit"
        ]);

        sm.open();

        sm.onSubmit().then(result => {
            console.log(`Selected option ${result.option.index} (${result.option.description})`);

            switch(result.option.index)
            {
                case 0: // Live Monitor
                    return liveMonitor();
                case 1: // Info View
                    return infoView();
                case 2: // Modify Config
                    return modifyConfig();
                case 3: // Exit
                    return process.exit(0);
            }
        });
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

/**
 * Opens the live monitor, showing some stats and live DNS updates
 */
function liveMonitor()
{

}

/**
 * Opens the info view (list of information about supervised domains, records, etc.)
 */
function infoView()
{

}

function modifyConfig()
{
    let modSm = new scl.SelectionMenu(`Modify Config`, { cancelable: true });

    modSm.setOptions([
        "Edit Config",
        "Recreate Config",
        "Delete Config",
        "Back to Main Menu"
    ]);

    modSm.locale.cancel = "Back";

    modSm.open();

    let modMenFn = (async () => {
        let modRes = await modSm.onSubmit();

        switch(modRes.option.index)
        {
            case 0: // Edit Config
                // config.edit();
                console.log("Work in Progress!\nPlease use the \"Recreate\" option instead.");
                scl.pause().then(() => {
                    return modifyConfig();
                });
            break;
            case 1: // Recreate Config
                config.create();
            break;
            case 2: // Delete Config
                config.remove();

                console.log(`${settings.name} will now exit. You may immediately restart it to trigger the initial prompt again.`);
                scl.pause().then(() => process.exit(0) );
            break;
            case 3: // Main Menu
            default:
                return main();
        }
    });

    return modMenFn();
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

module.exports = { main, firstStart, input };
