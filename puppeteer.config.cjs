const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    // Puppeteer cache dizinini değiştiriyoruz
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
}; 