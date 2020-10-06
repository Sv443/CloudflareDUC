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
}

module.exports = Object.freeze(settings);
