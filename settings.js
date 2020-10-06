const pkg = require("./package.json");

const settings = {
    verboseLogging: true,
    name: "CloudflareDUC",
    version: pkg.version,
    versionInt: pkg.version.split(".").map(x=>parseInt(x)),
    author: pkg.author,
    githubURL: "https://github.com/Sv443/CloudflareDUC",
    configPath: "./.config.json",
    restartInterval: 10, // in seconds
    init: {
        ensureDirectories: [
            "./logs/"
        ]
    },
    fetchLoopInterval: 5, // in minutes
}

module.exports = Object.freeze(settings);
