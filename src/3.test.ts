import { strict as assert } from 'assert';
import { unit } from './lib';

const u = unit('3');

u.test('assert fails', () => {
    console.log('asserting that true is false');
    assert.equal(true, false);
});

u.test('assert fails with promise', () => {
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            try {
                console.log('asserting that true is false');
                assert.equal(true, false);
                resolve();
            } catch (error) {
                reject(error);
            }
        }, 1),
    );
});
