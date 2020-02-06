
/**
 * Parses an input and returns its boolean equivalent
 * @param {*} input
 * @returns {Boolean|undefined} Returns undefined if variable couldn't be parsed
 */
const parseBool = input => {
    if(input === "true"
    || input === "1"
    || input === "yes"
    || input === "y"
    || input === 1
    || input == true) return true;
    else
    if(input === "false"
    || input === "0"
    || input === "no"
    || input === "n"
    || input === 0
    || input == false) return false;
    else return undefined;
}

module.exports = parseBool;