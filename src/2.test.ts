import { strict as assert } from 'assert';
import { unit } from './lib';

const u = unit('2');

let beforeAll1 = false;
let beforeAll2 = false;
let beforeEach1 = false;
let beforeEach2 = false;

u.beforeAll(() => {
    console.log('beforeAll1 = true');
    beforeAll1 = true;
});

u.beforeAll(() => {
    return new Promise((resolve) =>
        setTimeout(() => {
            console.log('beforeAll2 = true');
            beforeAll2 = true;
            resolve();
        }, 1),
    );
});

u.beforeEach(() => {
    console.log('beforeEach1 = true');
    beforeEach1 = true;
});

u.beforeEach(() => {
    return new Promise((resolve) =>
        setTimeout(() => {
            console.log('beforeEach2 = true');
            beforeEach2 = true;
            resolve();
        }, 1),
    );
});

u.afterEach(() => {
    console.log('beforeEach1 = false');
    beforeEach1 = false;
});

u.afterEach(() => {
    assert.equal(beforeEach1, false);
    return new Promise((resolve) =>
        setTimeout(() => {
            console.log('beforeEach2 = false');
            beforeEach2 = false;
            resolve();
        }, 1),
    );
});

u.afterEach(() => {
    assert.equal(beforeEach2, false);
});

u.afterAll(() => {
    console.log('beforeAll1 = false');
    beforeAll1 = false;
});

u.afterAll(() => {
    assert.equal(beforeAll1, false);
    return new Promise((resolve) =>
        setTimeout(() => {
            console.log('beforeAll2 = false');
            beforeAll2 = false;
            resolve();
        }, 1),
    );
});

u.afterAll(() => {
    assert.equal(beforeAll2, false);
});

u.test('beforeAll was run', () => {
    console.log('running test');
    assert.equal(beforeAll1, true);
    assert.equal(beforeAll2, true);
});

u.test('beforeEach was run', () => {
    console.log('running test');
    assert.equal(beforeEach1, true);
    assert.equal(beforeEach2, true);
});
