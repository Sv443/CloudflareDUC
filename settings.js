const settings = {
    name: "CloudflareDUC",
    verboseLogging: true,
    init: {
        ensureDirectories: [
            "./logs/"
        ]
    },
    fetchLoopInterval: 5, // in minutes
}

module.exports = Object.freeze(settings);
