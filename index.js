'use strict';

const Chrome = require('./chrome');
const { ChromeConnector } = require('chrome-connector');
const os = require('os');

main()
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

async function main() {
    const chrome = new Chrome({
        chromePath: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
        args: [
            '--remote-debugging-port=9222',
            '--no-first-run',
            `--user-data-dir=${os.tmpdir()}/chrome-test-${Math.random}`,
        ],
    });
    await chrome.start();
    const tab = await chrome.newTab();
    const cdp = new ChromeConnector(tab.webSocketDebuggerUrl);
    await cdp.connect();
    cdp.on('Network.requestIntercepted', onRequestIntercepted);
    await cdp.sendCommand('Network.enable');
    await cdp.sendCommand('Network.setRequestInterceptionEnabled', {
        enabled: true,
    });
    await cdp.sendCommand('Page.navigate', {
        url: 'https://github.com',
    });
    console.log('Navigated');

    async function onRequestIntercepted(details) {
        const {
            interceptionId,
            request,
        } = details;
        console.log(request.method, request.url);
        cdp.sendCommand('Network.continueInterceptedRequest', { interceptionId });
    }

}
