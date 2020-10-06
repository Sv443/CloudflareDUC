const { resolve } = require("path");

const pkg = require("./package.json");

const settings = {
    verboseLogging: true,
    name: "CloudflareDUC",
    version: pkg.version,
    versionInt: pkg.version.split(".").map(x=>parseInt(x)),
    author: pkg.author,
    githubURL: "https://github.com/Sv443/CloudflareDUC",
    configPath: resolve("./.config.json"),
    restartInterval: 10, // in seconds
    init: {
        ensureDirectories: [
            resolve("./logs/")
        ]
    },
    fetchLoopInterval: 5, // in minutes
}

module.exports = Object.freeze(settings);
