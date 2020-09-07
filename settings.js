const settings = {
    name: "CloudflareDUC",
    githubURL: "https://github.com/Sv443/CloudflareDUC",
    configPath: "./.config.json",
    verboseLogging: true,
    init: {
        ensureDirectories: [
            "./logs/"
        ]
    },
    fetchLoopInterval: 5, // in minutes
}

module.exports = Object.freeze(settings);
