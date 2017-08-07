'use strict';

const os = require('os');
const { spawn } = require('child_process');
const fetch = require('node-fetch');

const STANDARD_PATHS = {
    darwin: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    linux: '/opt/google/chrome/chrome',
    win32: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
};

module.exports = function createChromeShell(options = {}) {

    const {
        chromePath = STANDARD_PATHS[os.platform()],
        debuggingPort = 9222,
        stdio = 'ignore',
        env = {},
        httpTimeout = 5000,
        args = [],
        spawnOptions = {},
    } = options;

    let chromeProcess = null;

    // Do not leave dangling child process after parent exits
    process.on('exit', () => {
        if (chromeProcess) {
            chromeProcess.kill();
        }
    });

    return {
        start,
        stop,
        getProcess,
        getTabs,
        newTab,
    };

    async function start() {
        if (chromeProcess) {
            return;
        }
        chromeProcess = spawn(chromePath, args, Object.assign({
            stdio,
            env: Object.assign({}, process.env, env),
        }, spawnOptions));
        chromeProcess.on('exit', status => {
            chromeProcess = null;
            const err = new Error(`Chrome process exited (status = ${status})`);
            err.details = { status };
            // eslint-disable-next-line no-console
            console.error(err);
            process.exit(1);
        });
    }

    function stop() {
        chromeProcess.kill();
    }

    function getProcess() {
        return chromeProcess;
    }

    async function newTab() {
        return await makeHttpRequest('/json/new');
    }

    async function getTabs() {
        const targets = await makeHttpRequest('/json');
        return targets.filter(t => t.type === 'page');
    }

    async function makeHttpRequest(pathname) {
        const url = `http://localhost:${debuggingPort}${pathname}`;
        const timeoutAt = Date.now() + httpTimeout;
        while (Date.now() < timeoutAt) {
            try {
                const res = await fetch(url);
                return await res.json();
            } catch (e) {
                await new Promise(r => setTimeout(r, 500));
            }
        }
        throw new Error('Connecting to Chrome failed');
    }

};
