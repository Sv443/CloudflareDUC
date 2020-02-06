/**
 * Returns a pre-formatted date in local time
 */
const getDate = () => {
    let d = new Date();
    return `[${d.getFullYear()}/${(d.getMonth() + 1) < 10 ? "0" : ""}${d.getMonth() + 1}/${d.getDate() < 10 ? "0" : ""}${d.getDate()} - ${d.getHours() < 10 ? "0" : ""}${d.getHours()}:${d.getMinutes() < 10 ? "0" : ""}${d.getMinutes()}:${d.getSeconds() < 10 ? "0" : ""}${d.getSeconds()}]`;
}

module.exports = getDate;