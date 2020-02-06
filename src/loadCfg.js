const settings = require("./intsettings"); // internal settings
const fs = require("fs"); // file system
const logger = require("./logger");


// initializes the config loader / converter
function init() {
    // let loadCfgHR = process.hrtime(); // start measuring the time it takes to convert all .cfg files
    if(settings.verboseLogging) console.log(`\x1b[33m\x1b[1m[Config]\x1b[0m Initializing...`);
    return new Promise((resolve, reject) => {
        try {
            let fileContent = fs.readFileSync(settings.configFile); // read the config file
            if(fileContent.toString().includes("§END")) module.exports.settings = JSONify(fileContent);
            resolve();
        }
        catch(err) { // general error catcher
            reject(`Error in config file loader:\n${err}`);
        }
    });
}
module.exports.init = init;


/**
 * Converts text formatted as .cfg to a JSON object
 * @param {String} cfgtext Content of the CFG file
 * @returns {Object}
 */
function JSONify(cfgtext) { // Taken from my newest project, JServ

    let doneObj = {}; // this is where all properties get inserted over time to create the final JSON object

    cfgtext = cfgtext.toString(); // ensure text is a string and not a buffer

    cfgtext = cfgtext.split(/\n/gm); // split at line break

    // iterate over each line if it matches the one line syntax:
    cfgtext.forEach((line, i) => {
        if(matchingCfgSyntax(line)) {
            if(line.includes("#")) line = line.split("#")[0]; // remove comment if there is one
            line = line.trim(); // remove leading and trailing whitespaces

            // generate key/value pair:
            let key = line.split("=")[0].trim();
            let val = line.split("=")[1].trim().replace(/"/gm, "");

            // assign key/value pair to `doneObj`
            doneObj[key] = val;
        }
        // iterate over multiple adjacent lines if they match the nested syntax:
        else if(matchingNestedSyntax(line)) {
            let nend = false;
            let nestedObjKey = line.replace("@", "").replace(/\r/gm, ""); // generate the nested object's key
            let nestedObjRaw = "";

            cfgtext.forEach((line2, i2) => { // iterate over each line of the file again
                if(i2 == i) nend = true;     // find the starting position of the nested object
                if(nend) {                   // if the starting position has been found, continue
                    if(matchingCfgSyntax2(line2)) nestedObjRaw += `${line2}\n`; // if the line inside the nested object matches the single line syntax, add it to the final object
                    if(line2.includes(`@end ${nestedObjKey}`)) nend = false;   // find out the ending position of the nested object
                }

                // if no ending position for the nested object could be found until the end of the file, throw an error:
                if(line2 == "§END" && nend == true) throw new Error(`Error while loading config file.\nYou are probably missing an end tag for a nested object or it has been misspelt.\nFor example, to close the nested object "@CORS" you'd need to end it with "@end CORS".`);
            });

            let raw = nestedObjRaw.replace(/\r/gm, "").split(/\n/gm);
            let nestedDoneObj = {};
            let ct = 0;

            raw.forEach(line3 => {
                if(!line3.includes("@") && matchingCfgSyntax2(line3)) { // check whether the line matches the nested object key/value syntax (prefixed with $)
                    if(line3.includes("#")) line3 = line3.split("#")[0]; // remove comments if there are any

                    // generate a key/value pair:
                    let key = line3.split("=")[0].trim();
                    let val = line3.split("=")[1].trim().replace(/"/gm, "");

                    if(key.includes("$") && key.split("$")[0] == "") { // second layer of checking if the line matches the nested object key/value syntax
                        key = key.replace(/\$/gm, ""); // remove the $ prefix
                        nestedDoneObj[key] = val; // finally create the complete nested object

                        ct++;
                    }
                }
            });

            if(ct > 0) doneObj[nestedObjKey] = nestedDoneObj; // only add the nested object to the final done object if it has some values inside to prevent having an empty nested object
        }
    });

    // if(settings.verboseLogging) console.log(`\x1b[33m\x1b[1m[Config]\x1b[0m Current cfg object (\x1b[33m\x1b[1m${file}\x1b[0m):\n${JSON.stringify(doneObj, null, 4)}\x1b[0m`);

    return doneObj; // return the full JSON object
}
module.exports.JSONify = JSONify; // export the function cause I might need it somewhere else

/**
 * Checks whether a line matches the syntax of .cfg files
 * @param {String} line
 * @returns {Boolean}
 */
function matchingCfgSyntax(line) {
    if(line.includes("=")) {
        if(line.split("=")[0].trim().length > 0 &&
        !line.split("=")[0].trim().includes("#") && // check whether the first occurrence of an equals sign is inside a comment
        line.split("=")[1].trim().length > 0) {
            if(!line.trim().startsWith("$")) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Checks whether a line matches the syntax of .cfg files and additionally starts with !
 * @param {String} line 
 * @returns {Boolean}
 */
function matchingCfgSyntax2(line) {
    if(line.includes("=")) {
        if(line.split("=")[0].trim().length > 0 &&
        !line.split("=")[0].trim().includes("#") && // check whether the first occurrence of an equals sign is inside a comment
        line.split("=")[1].trim().length > 0) {
            if(line.trim().startsWith("$")) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Checks whether a line matches the custom syntax for a nested object
 * @param {String} line 
 * @param {String} fileContent
 * @returns {Boolean}
 */
function matchingNestedSyntax(line) {
    if(line.includes("@") && !line.includes("@end ")) {
        if(line.split("@")[0] == (null || "") && line.split("@")[1].length > 0) { // checks whether the line starts with the syntax for a nested object
            return true;
        }
    }
    return false;
}





/**
 * Checks whether the ".env" and "settings.cfg" files exist or not and create them, if they don't
 */
function verifyCfgFiles() {
    try {
        let needsRestart = false;
        let verEnv = () => fs.existsSync("./.env");
        let verSet = () => fs.existsSync("./settings.cfg");

        if(!verEnv()) {
            needsRestart = true;
            fs.writeFileSync("./.env", settings.defaultValues.env);
        }
        if(!verSet()) {
            needsRestart = true;
            fs.writeFileSync("./settings.cfg", settings.defaultValues.settings);
        }

        if(!needsRestart) return true;
        else {
            console.log("\n\n\x1b[33m\x1b[1mOne or more of the config files was not found.\nThey have been regenerated, so please close this window (auto-closes after 20s), edit them and then re-open CloudflareDUC.\n\n\x1b[0m");
            setTimeout(()=>process.exit(0), 20000);
            return false;
        }
    }
    catch(err) {
        console.log(`\n\n\x1b[31m\x1b[1mError while verifying .env and settings.cfg files.\nDetailed error message: ${err}\x1b[0m`);
        logger("startupError", `Error while verifying .env and settings.cfg files`, err);
        process.exit(1);
    }
}

module.exports.verifyCfgFiles = verifyCfgFiles;
