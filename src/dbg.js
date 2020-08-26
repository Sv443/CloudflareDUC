const scl = require("svcorelib");

const settings = require("../settings");
const col = scl.colors.fg;


function dbg(section, message)
{
    if(settings.verboseLogging)
        console.log(`${col.yellow}[DBG/${col.blue}${section}${col.yellow}]: ${col.rst}${message}`);
}

module.exports = dbg;
