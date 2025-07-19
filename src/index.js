const core = require("@actions/core");
const tc = require("@actions/tool-cache");
const path = require("path");
const crypto = require("crypto");
const process = require('node:process');


const MAVEN_RELEASES_API = 'https://api.github.com/repos/apache/maven/releases/latest';


async function run() {

    const mavenVersionInput = core.getInput('maven_version', {required: false, trimWhitespace: true});


    const mirrorUrlPattern = core.getInput('download_url_pattern', {
        required: false,
        trimWhitespace: true
    });

    let mavenVersion = mavenVersionInput;
    if (!mavenVersion) {
        const response = await fetch(MAVEN_RELEASES_API);
        if (!response.ok) {
            throw new Error(`Failed to fetch Maven version: ${response.statusText}`);
        }
        const {name} = await response.json();
        mavenVersion = name;
        core.info(`Latest Maven version: ${mavenVersion}`);
    }
    core.info(`Using Maven version: ${mavenVersion}`);

    let mavenCachePath = tc.find('maven', mavenVersion);
    if (!mavenCachePath) {
        const mavenUrl = mirrorUrlPattern.replaceAll('{version}', mavenVersion);
        core.info(`Downloading Maven from: ${mavenUrl}`);
        let downloadPath;
        const uuid = crypto.randomUUID();
        const destDir = path.join(process.env.RUNNER_TEMP || '_temp', uuid);
        const ext = ['.zip', '.tar.gz'].find(e => mavenUrl.endsWith(e));
        if (!ext) {
            throw new Error(`Unsupported archive format for download: ${mavenUrl}`);
        }
        const destPath = path.join(destDir, `${mavenVersion}${ext}`);
        downloadPath = await tc.downloadTool(mavenUrl, destPath);
        let extractedPath;
        if (ext === '.zip') {
            extractedPath = await tc.extractZip(downloadPath);
        } else {
            extractedPath = await tc.extractTar(downloadPath);
        }
        mavenCachePath = await tc.cacheDir(extractedPath, 'maven', mavenVersion);

        core.info(`Cached Maven at: ${mavenCachePath}`);
    } else {
        core.info(`Found cached Maven at: ${mavenCachePath}`);
    }
    const mavenHome = path.join(mavenCachePath, `apache-maven-${mavenVersion}`);
    core.addPath(path.join(mavenHome, 'bin'));
    core.exportVariable('MAVEN_HOME', mavenHome);
    core.info(`Maven setup complete. MAVEN_HOME set to: ${mavenHome}`);
}

run().then(() => {
    core.info('Action completed.');
}).catch(error => {
    core.setFailed(`Action failed with error: ${error.message}`);
    console.error(error);
})