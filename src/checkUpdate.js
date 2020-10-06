const semver = require("semver");
const scl = require("svcorelib");

const xhr = require("./xhr");

const settings = require("../settings");


/**
 * @typedef {Object} ReleaseInfo
 * @prop {Boolean} updateAvailable true, if a new version is available
 * @prop {String} name Name of the version
 * @prop {String|null} version Sanitized version - null if invalid
 * @prop {String} url URL to the release page
 * @prop {Boolean} prerelease true, if this version is a prerelease
 */

/**
 * Returns the latest release's version and URL
 * @param {Boolean} [ensureNotPrerelease=false] Set to true to make sure the returned release is not a prerelease
 * @returns {Promise<ReleaseInfo|null, String>} Resolves with an object containing data on the latest release or null if no match was found or rejects with an error string
 */
function getLatestVersion(ensureNotPrerelease)
{
    // API reference: https://developer.github.com/v3/repos/releases/#get-the-latest-release

    if(ensureNotPrerelease !== true)
        ensureNotPrerelease = false;

    return new Promise((pRes, pRej) => {
        xhr("GET", "https://api.github.com/repos/Sv443/CloudflareDUC/releases").then(val => {
            if(!val || !Array.isArray(val.data) || (Array.isArray(val.data) && val.data.length == 0))
                return pRej(`No releases found`);

            let releasesAmount = val.data.length;
            /** @type {ReleaseInfo|null} */
            let releaseInfo = null;

            const getIdx = (idx) => {
                let rel = val.data[idx];

                if(!rel)
                {
                    releaseInfo = null;
                    return;
                }

                /** @type {semver.SemVer} */
                let parsed;
                try
                {
                    parsed = semver.parse(rel.tag_name);
                }
                catch(err)
                {
                    scl.unused(err);
                    releaseInfo = null;
                    parsed = null;
                }

                if(parsed == null)
                    return;

                releaseInfo = {
                    // updateAvailable: semver.lt("0.2.0", parsed.version), // DBG
                    updateAvailable: semver.lt(settings.version, rel.tag_name),
                    name: rel.name,
                    version: parsed.version,
                    url: rel.html_url,
                    prerelease: rel.prerelease
                };
            };
            
            for(let i = 0; i < releasesAmount; i++)
            {
                getIdx(i);

                if(ensureNotPrerelease === true && releaseInfo.prerelease == false)
                    break;

                if(ensureNotPrerelease !== true && releaseInfo != null)
                    break;
                
                if(i == (releasesAmount - 1))
                    releaseInfo = null;
            }

            return pRes(releaseInfo);
        });
    });
}

module.exports = { getLatestVersion };
