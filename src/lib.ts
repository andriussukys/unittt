export interface Unit {
    beforeAll: (callback: Callback) => void;
    beforeEach: (callback: Callback) => void;
    test: (name: string, callback: Callback) => void;
    afterEach: (callback: Callback) => void;
    afterAll: (callback: Callback) => void;
    run: (testRunner: TestRunner) => Promise<boolean>;
}

export type Callback = (() => void) | (() => Promise<void>);

export interface TestRunner {
    beginUnit: (unitName: string) => Promise<void>;
    beginTest: (unitName: string, testName: string) => Promise<void>;
    endTest: (unitName: string, testName: string, passed: boolean, error?: unknown) => Promise<void>;
    endUnit: (unitName: string, passed: boolean, error?: unknown) => Promise<void>;
    beginCaptureOutput: (state: 'beforeAll' | 'test' | 'afterAll') => Promise<void>;
    endCaptureOutput: (state: 'beforeAll' | 'test' | 'afterAll') => Promise<void>;
    logError: (
        unitName: string,
        testName: string | undefined,
        state: 'beforeAll' | 'beforeEach' | 'test' | 'afterEach' | 'afterAll',
        error: unknown,
    ) => Promise<void>;
}

const units: Unit[] = [];

export function unit(name: string): Unit {
    const beforeAll: Callback[] = [];
    const beforeEach: Callback[] = [];
    const tests: { name: string; callback: Callback }[] = [];
    const afterAll: Callback[] = [];
    const afterEach: Callback[] = [];
    const unit: Unit = {
        beforeAll: (callback) => {
            beforeAll.push(callback);
        },
        beforeEach: (callback) => {
            beforeEach.push(callback);
        },
        test: (name, callback) => {
            tests.push({ name: name, callback: callback });
        },
        afterEach: (callback) => {
            afterEach.push(callback);
        },
        afterAll: (callback) => {
            afterAll.push(callback);
        },
        run: async (testRunner) => {
            await testRunner.beginUnit(name);
            let allTestsPassed = true;
            let unitError;
            let caughtUnitError = false;
            if (beforeAll.length > 0) {
                await testRunner.beginCaptureOutput('beforeAll');
                try {
                    await runCallbacks(beforeAll);
                } catch (e) {
                    await testRunner.logError(name, undefined, 'beforeAll', e);
                    unitError = e;
                    caughtUnitError = true;
                }
                await testRunner.endCaptureOutput('beforeAll');
            }
            if (!caughtUnitError) {
                for (const test of tests) {
                    await testRunner.beginTest(name, test.name);
                    await testRunner.beginCaptureOutput('test');
                    let testError;
                    let caughtTestError = false;
                    try {
                        await runCallbacks(beforeEach);
                    } catch (e) {
                        await testRunner.logError(name, test.name, 'beforeEach', e);
                        testError = e;
                        caughtTestError = true;
                    }
                    if (!caughtTestError) {
                        try {
                            const result = test.callback();
                            if (result) {
                                await result;
                            }
                        } catch (e) {
                            await testRunner.logError(name, test.name, 'test', e);
                            testError = e;
                            caughtTestError = true;
                        }
                    }
                    try {
                        await runCallbacks(afterEach);
                    } catch (e) {
                        await testRunner.logError(name, test.name, 'afterEach', e);
                        if (!caughtTestError) {
                            testError = e;
                        }
                        caughtTestError = true;
                    }
                    await testRunner.endCaptureOutput('test');
                    await testRunner.endTest(name, test.name, !caughtTestError, testError);
                    allTestsPassed &&= !caughtTestError;
                }
            }
            if (afterAll.length > 0) {
                await testRunner.beginCaptureOutput('afterAll');
                try {
                    await runCallbacks(afterAll);
                } catch (e) {
                    await testRunner.logError(name, undefined, 'afterAll', e);
                    if (!caughtUnitError) {
                        unitError = e;
                    }
                    caughtUnitError = true;
                }
                await testRunner.endCaptureOutput('afterAll');
            }
            const passed = !caughtUnitError && allTestsPassed;
            await testRunner.endUnit(name, passed, unitError);
            return passed;
        },
    };
    units.push(unit);
    return unit;
}

export async function runAllUnitTests(testRunner: TestRunner): Promise<boolean> {
    let passed = true;
    for (const unit of units) {
        const unitPassed = await unit.run(testRunner);
        passed &&= unitPassed;
    }
    return passed;
}

async function runCallbacks(callbacks: Callback[]) {
    for (const callback of callbacks) {
        const result = callback();
        if (result) {
            await result;
        }
    }
}
