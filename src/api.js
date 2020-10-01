const Cloudflare = require("cloudflare");

const crypto = require("./crypto");


/** @type {Cloudflare} */
var cf;
/** @type {String} API Token */
var token;


/**
 * Initializes the connection to the Cloudflare API
 * @param {Object} apiToken The encrypted API token
 * @returns {Promise}
 */
function init(apiToken)
{
    return new Promise((pRes, pRej) => {
        token = crypto.decrypt(apiToken);

        cf = Cloudflare({ token });

        cf.user.read().then(res => {
            if(res.result.length < 1)
                return pRej(`CloudflareDUC doesn't have access to the Cloudflare API. Maybe the provided auth token is invalid.`);
            return pRes();
        }).catch(err => {
            return pRej(`${err.statusCode} ${err.statusMessage} - Maybe the provided auth token is invalid.`);
        });
    });
}

/**
 * Returns a promise containing an array of record objects
 * @returns {Promise<Record[]>}
 */
function getAllRecords()
{

}

module.exports = { init, getAllRecords };
