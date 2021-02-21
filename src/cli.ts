import fs from 'fs';
import path from 'path';
import { runAllUnitTests } from './lib';

if (process.argv.length < 4) {
    console.error('Usage: npx unittt [directory] [file-pattern-regex]+');
    process.exit(1);
}

function collectTestFiles(dir: string) {
    for (const name of fs.readdirSync(dir)) {
        const file = path.resolve(dir, name);
        const stat = fs.statSync(file);
        if (stat.isDirectory()) {
            collectTestFiles(file);
        } else if (stat.isFile() && fileMatchesPatter(file)) {
            testFiles.push(file);
        }
    }
}

function fileMatchesPatter(file: string) {
    for (const pattern of patterns) {
        if (pattern.test(file)) {
            return true;
        }
    }
    return false;
}

const rootDir = process.argv[2];
const patterns = process.argv.slice(3).map((pattern) => new RegExp(pattern));
const testFiles: string[] = [];

collectTestFiles(rootDir);
testFiles.sort();

logTitle('Initializing', '=');
console.info('```');
for (const testFile of testFiles) {
    console.log('Importing test file: ' + testFile);
    require(testFile);
}
console.info('```\n');

const unitResults: { name: string; passed: boolean; results: { name: string; passed: boolean }[] }[] = [];
let currentUnitTestResults: { name: string; passed: boolean }[] = [];
const errors: { unitName: string; testName: string | undefined; state: string; error: unknown }[] = [];

runAllUnitTests({
    beginUnit: (unitName) => {
        logTitle('Unit: ' + unitName, '=');
        currentUnitTestResults = [];
        return Promise.resolve();
    },
    beginTest: (unitName, testName) => {
        logTitle('Test: ' + testName, '-');
        return Promise.resolve();
    },
    endTest: (unitName, testName, passed, error) => {
        logResult('Test', passed);
        logError(error);
        currentUnitTestResults.push({ name: testName, passed: passed });
        return Promise.resolve();
    },
    endUnit: (unitName, passed, error) => {
        logTitle('Summary', '-');
        logResult('Unit', passed);
        logError(error);
        logResults(currentUnitTestResults);
        unitResults.push({ name: unitName, passed: passed, results: currentUnitTestResults });
        return Promise.resolve();
    },
    beginCaptureOutput: () => {
        console.info('```');
        return Promise.resolve();
    },
    endCaptureOutput: () => {
        console.info('```\n');
        return Promise.resolve();
    },
    logError: (unitName, testName, state, error) => {
        errors.push({
            unitName: unitName,
            testName: testName,
            state: state,
            error: error,
        });
        return Promise.resolve();
    },
})
    .then((passed) => {
        logTitle('Summary', '=');
        logResults(unitResults);
        process.exit(passed ? 0 : 1);
    })
    .catch((error) => {
        logTitle('Error', '=');
        logError(error);
        for (const error of errors) {
            console.info('```');
            console.info('Error - ' + error.unitName + (error.testName != null ? ' - ' + error.testName : '') + ' - ' + error.state);
            console.info(error);
            console.info('```\n');
        }
        process.exit(1);
    });

function logTitle(title: string, level: string) {
    console.info(title + '\n' + level.repeat(title.length) + '\n');
}

function logResult(label: string, passed: boolean) {
    console.info(label + ' ' + (passed ? '**PASS**' : '**FAIL**') + '\n');
}

function logResults(results: { name: string; passed: boolean; results?: { name: string; passed: boolean }[] }[]) {
    for (const result of results) {
        console.info('* ' + (result.passed ? '**PASS**' : '**FAIL**') + ' ' + result.name);
        if (result.results) {
            for (const subResult of result.results) {
                console.info('    * ' + (subResult.passed ? '**PASS**' : '**FAIL**') + ' ' + subResult.name);
            }
        }
    }
    console.info();
}

function logError(error: unknown) {
    if (error != null) {
        console.info('```');
        console.info(error);
        console.info('```\n');
    }
}
