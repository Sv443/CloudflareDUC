// const scl = require("svcorelib");
const { XMLHttpRequest } = require("xmlhttprequest");


/**
 * @typedef {Object} XHRData
 * @prop {Boolean} error
 * @prop {String} [errorMsg]
 * @prop {Number} status
 * @prop {Object} [data]
 */

/**
 * Sends an HTTP request
 * @param {"GET"|"POST"|"PUT"|"DELETE"} method 
 * @param {String} url 
 * @param {String} [cfApiKey]
 * @returns {Promise<XHRData>}
 */
function sendRequest(method, url, cfApiKey)
{
    return new Promise((res) => {
        let xhr = new XMLHttpRequest();

        xhr.open(method, url, true);

        xhr.setRequestHeader("Content-Type", "application/json");

        if(cfApiKey && typeof cfApiKey == "string")
        {
            xhr.setRequestHeader("Authorization", `Bearer ${cfApiKey}`);
        }

        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4)
            {
                if(xhr.status >= 200 && xhr.status < 300)
                {
                    try
                    {
                        let jsonData = JSON.parse(xhr.responseText);

                        return res({
                            error: false,
                            status: xhr.status,
                            data: jsonData
                        });
                    }
                    catch(err)
                    {
                        return res({
                            error: true,
                            errorMsg: err,
                            status: xhr.status
                        });
                    }
                }
                else
                {
                    try
                    {
                        let jsonData = JSON.parse(xhr.responseText);

                        return res({
                            error: false,
                            status: xhr.status,
                            data: jsonData
                        });
                    }
                    catch(err)
                    {
                        return res({
                            error: true,
                            errorMsg: err,
                            status: xhr.status
                        });
                    }
                }
            }
        };

        xhr.send();
    });
}

module.exports = sendRequest;
