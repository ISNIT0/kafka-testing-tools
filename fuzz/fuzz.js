const config = require('../config.json');

const execSync = require('child_process').execSync;

function sh(command) {
    return execSync(command, {
        'stdio': 'pipe'
    }).toString();
}

module.exports = (number = 20) => {
    const patterns = config.radamsa.patterns;
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return sh(`echo "${pattern}" | radamsa --seed 12 -n ${number}`).trim().split('\n');
};