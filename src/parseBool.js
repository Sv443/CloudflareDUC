
/**
 * Parses an input and returns its boolean equivalent
 * @param {*} input
 * @returns {Boolean}
 */
const parseBool = input => {
    if(input === "true"
    || input === "1"
    || input === "yes"
    || input === "y"
    || input === 1) return true;
    else
    if(input === "false"
    || input === "0"
    || input === "no"
    || input === "n"
    || input === 0) return false;
    else return undefined;
}

module.exports = parseBool;