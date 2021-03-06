const scl = require("svcorelib");
const prompts = require("prompts");

const config = require("./config");
const checkUpdate = require("./checkUpdate");

const col = scl.colors.fg;
const settings = require("../settings");

//#MARKER menus

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
            "Info View",
            "Live Monitor [WIP]",
            "Edit Config",
            "About",
            "Exit"
        ]);

        sm.open();

        sm.onSubmit().then(result => {
            switch(result.option.index)
            {
                case 0: // Info View
                    return infoView();
                case 1: // Live Monitor
                    return liveMonitor();
                case 2: // Modify Config
                    return modifyConfig();
                case 3: // About
                    return about().then(() => main());
                case 4: // Exit
                    return process.exit(0);
            }
        });
    });
}

/**
 * Opens the info view (list of information about supervised domains, records, etc.)
 */
function infoView()
{
    let cfg = config.load();
    if(cfg.domains && cfg.domains.length > 0)
    {
        console.log(`Domains (${cfg.domains.length}):`);
        cfg.domains.forEach(domain => {
            console.log(`- ${domain.name} (${(domain.records && domain.records.length > 0) ? domain.records.length : 0} Record${(domain.records && domain.records.length == 1) ? "" : "s"}`);
        });

        console.log();

        scl.pause().then(() => main());
    }
    else
    {
        console.log(`${col.yellow}No domains have been enabled to be automatically updated. Please edit the configuration.${col.rst}\n`);

        scl.pause().then(() => main());
    }
}

/**
 * Opens the live monitor, showing some stats and live DNS updates
 */
function liveMonitor()
{
    console.log("Work in Progress!");
    scl.pause("Press any key to return to the main menu...").then(() => {
        return main();
    });
}

function modifyConfig()
{
    let modSm = new scl.SelectionMenu(`Modify Config`, { cancelable: true });

    modSm.setOptions([
        "Edit Config [WIP]",
        "Delete Config",
        "Back to Main Menu"
    ]);

    modSm.locale.cancel = "Back";

    modSm.open();

    let modMenFn = (async () => {
        let modRes = await modSm.onSubmit();

        if(modRes.canceled)
            return main();

        switch(modRes.option.index)
        {
            case 0: // Edit Config
                // config.edit();
                console.log("Work in Progress!\nPlease use the \"Delete Config\" option instead.");
                scl.pause().then(() => {
                    return modifyConfig();
                });
            break;
            case 1: // Delete Config
                prompts({
                    type: "confirm",
                    name: "value",
                    message: "Are you sure you want to delete the config file?",
                    initial: true
                }).then(res => {
                    if(res.value !== true)
                    {
                        console.log(`\n${col.yellow}Not deleting the config file.${col.rst}\n`);
                        scl.pause().then(() => {
                            return main();
                        });
                    }
                    else
                    {
                        config.remove();
                        console.log(`${settings.name} will now exit. You may immediately restart it to trigger the initial prompt again.`);
                        scl.pause().then(() => process.exit(0) );
                    }
                });
            break;
            case 2: // Main Menu
            default:
                return main();
        }
    });

    return modMenFn();
}

/**
 * Shows the "About" menu, displaying some information about CF-DUC.  
 * @returns {Promise} Promise resolves when the user presses any key
 */
function about()
{
    return new Promise(pRes => {
        /**
         * @param {checkUpdate.ReleaseInfo} release Release info
         * @param {checkUpdate.ReleaseInfo} prerelease Prerelease info
         */
        const logMsgs = (release, prerelease) => {
            console.log(`${col.green}${settings.name} ${col.yellow}v${settings.version}${col.rst}${col.rst}`);
            process.stdout.write("\n");
            console.log(`Made by ${col.yellow}${settings.author.name}${col.rst} ( ${settings.author.url} )`);
            console.log(`GitHub repo: ${settings.githubURL}`);

            if(release != null && release.updateAvailable)
            {
                // New release is available
                console.log("\n");
                console.log(`A new release of ${settings.name} is available:`);
                console.log(`Version ${release.version} - ${release.name}`);
                console.log(`Go to this page to download it: ${release.url}`);
            }
            else if(prerelease != null && (release == null || release != null && !release.updateAvailable) && prerelease.updateAvailable)
            {
                // No new release is available, but a prerelease is
                console.log("\n");
                console.log(`${col.yellow}A new (possibly unstable) prerelease of ${settings.name} is available${col.rst}`);
                console.log(`Description: ${prerelease.name} ${col.yellow}(v${prerelease.version})${col.rst}`);
                console.log(`Go to this page to download it: ${col.blue}${prerelease.url}${col.rst}`);
            }
            

            console.log("\n");

            scl.pause("Press any key to go back to the main menu...")
                .then(() => pRes())
                .catch(() => pRes());
        };

        checkUpdate.getLatestVersion(true).then(ri => {
            checkUpdate.getLatestVersion(false).then(pri => {
                return logMsgs(ri, pri);
            }).catch(err => {
                scl.unused(err);
                return logMsgs(ri, null);
            });
        }).catch(err => {
            scl.unused(err);
            return logMsgs(null, null);
        });
    });
}

module.exports = { main };
