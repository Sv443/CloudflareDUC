const config = require("./config");
require("dotenv").config();

let cfg = {};

async function initAll()
{
    if(!config.exists())
        await config.create();

    cfg = await config.load();

    let guiEnabled = true;
    process.argv.forEach(arg => {
        if(arg == "--nogui" || arg == "-ng")
            guiEnabled = false;
    });

    if(guiEnabled)
        mainMenu();
}

function mainMenu()
{
    let records = 0;
    cfg.domains.forEach(domain => {
        records += domain.records.length;
    });

    console.log(`Supervising ${records} record${records > 1 ? "s" : ""} of ${cfg.domains.length} domain${cfg.domains.length > 1 ? "s" : ""}`);

    // SCL SelectionPrompt
}

initAll();
