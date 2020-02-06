const fs = require("fs");

const settings = require("./intsettings"); // internal settings
const getDate = require("./getDate"); // get the date in the correct format


/**
 * Logs information to a log file
 * @param {String} filename 
 * @param {String} title 
 * @param {String} details 
 */
const log = (filename, title, details) => {
    if(!fs.existsSync(settings.logger.basePath)) fs.mkdirSync(settings.logger.basePath);
    try {
        let file = `${settings.logger.basePath}${filename}.log`;
        let content = `${getDate()} - ${title}:\n${details}\n-------------------------------------\n\n\n`;
        
        if(fs.existsSync(file)) fs.appendFileSync(file, content);
        else fs.writeFileSync(file, content);
    }
    catch(err) {
        console.log(`\n\n\x1b[31m\x1b[1m[Logger]\x1b[0m Error while logging to "${settings.logger.basePath}${filename}.log".\nDetailed error: ${err}\n\n`);
    }
}

module.exports = log;