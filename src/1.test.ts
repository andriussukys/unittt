import { unit } from './lib';

const u = unit('1');

u.test('test1', () => {
    console.log('console output from test1');
});

u.test('test2 with promise', () => {
    console.log('console output before returning a promise');
    return new Promise((resolve) => {
        console.log('console output before resolving a promise');
        setTimeout(resolve, 1);
    });
});
