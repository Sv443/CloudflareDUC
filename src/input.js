const prompts = require("prompts");
const scl = require("svcorelib");

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

module.exports = input;
