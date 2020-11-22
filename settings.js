const { resolve } = require("path");

const pkg = require("./package.json");

const settings = {
    verboseLogging: true, // set to true to log some verbose debug stuff to the console
    name: "CloudflareDUC",
    version: pkg.version,
    versionInt: pkg.version.split(".").map(x=>parseInt(x)),
    author: pkg.author,
    githubURL: "https://github.com/Sv443/CloudflareDUC", // URL to the GitHub repo
    configPath: resolve("./.config.json"), // path to the config file
    restartInterval: 10, // in seconds
    init: {
        splashScreenTime: 2, // how many seconds to show the splash screen for
        ensureDirectories: [ // ensures that the following directories exist
            resolve("./logs/")
        ]
    },
    fetchLoopInterval: 5, // in minutes
    /** [ Width, Height ] - Padding of the ASCII logo */
    asciiLogoPadding: [ 0, 0 ],
    /** Options for the package asciify-image - Documentation: https://www.npmjs.com/package/asciify-image#optionscolor */
    asciifyOpts: {
        color: true,
        fit: "box",
        format: "array"
    }
}

module.exports = Object.freeze(settings);
