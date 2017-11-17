module.exports = {
    apps: [{
        name: "Producer",
        script: "./fuzz/produce.js",
        instances: 3,
        watch: true
    }, {
        name: "Instantiator",
        script: "./fuzz/index.js",
        watch: true
    }]
};