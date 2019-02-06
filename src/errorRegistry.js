module.exports = {
    "100": {
        message: "Couldn't fetch your public IP address - This could be your firewall or proxy blocking the request. Please make sure nothing blocks this application!"
    },
    "101": {
        message: "StSc overflow - this can't be fixed by you so please contact me (Sv443) to resolve this issue."
    },
    "200": {
        message: "Couldn't talk to the Cloudflare API. Make sure you entered the correct token and you have an internet connection. Also check if Cloudflare is offline."
    },
    "201": {
        message: "Couldn't talk to the Cloudflare API. Make sure you entered the correct token and you have an internet connection. Also check if Cloudflare is offline."
    },
    "202": {
        message: "Couldn't update DNS record. This might be an issue with your IP address. Please try manually updating the value of the DNS record(s). If that doesn't work, your ISP might be blocking it."
    },
    "300": {
        message: "Couldn't start the ping interval. This error doesn't occur naturally so please contact me (Sv443) to resolve this issue."
    },
    "301": {
        message: "Encountered error while pinging the host. make sure the hosturl attribute in the settings.cfg points to the root of your website and follows the pattern \"http(s)://[subdomain/www].[host].[topleveldomain]/\" and your server/website is running!"
    },
    "400": {
        message: "Encountered error while shutting down the script. This error doesn't occur naturally so please ontact me (Sv443) to resolve this issue."
    },
    "500": {
        message: "Settings validation is wrong, please make sure the script is up to date and you haven't accidentally modified it."
    },
    "501": {
        message: "Settings are misconfigured. Please make sure to follow the examples in the GitHub repository and make sure you haven't accidentally removed an equals sign or added one."
    },
    "600": {
        message: "Settings.cfg file wasn't found. Please make sure you haven't accidentally deleted or renamed it and re-download the application if it still doesn't work."
    },
    "601": {
        message: ".env file wasn't found or is formatted incorrectly. Please make sure you haven't accidentally deleted or renamed it and re-download the application if it still doesn't work."
    }
}