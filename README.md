# Unittt

Unit test library for TypeScript.

## Why

There are many good unit testing frameworks/libraries. Please use any one of them.\
For example (in alphabetical order):

* [Jasmine](https://jasmine.github.io/)
* [Jest](https://jestjs.io/)
* [Karma](https://karma-runner.github.io/)
* [Mocha](https://mochajs.org/)
* insert your favorite here

If the ones above feel too heavy for you then read on.

## Features

* Zero dependencies (see [package.json](./package.json))
    * Unittt will not compile TypeScript, it works with files that are already compiled to standard Javascript
    * No assertion libraries included, use your favorite, try [Node Assert](https://nodejs.org/api/assert.html)
* Zero configuration
* Tests are run sequentially in a predictable order
* Simple CLI interface
* Generates nice looking report in Markdown format, see [example](./test-report-example.md)

## Test Examples

### Basic

```typescript
import { unit } from 'unittt';

const u = unit('basic example');

u.test('test pass', () => {
    // insert test code here
});

u.test('test fail', () => {
    throw new Error();
});
```

### With Promises

```typescript
import { unit } from 'unittt';

const u = unit('basic example with promises');

u.test('test pass', () => {
    return Promise.resolve();
});

u.test('test fail', () => {
    throw Promise.reject();
});
```

### With Promises That Actually Wait

```typescript
import { unit } from 'unittt';

const u = unit('basic example with promises');

u.test('test pass', () => {
    // test will pass after 1 second
    return new Promise((resolve) => setTimeout(resolve, 1000));
});

u.test('test fail', () => {
    // test will fail after 1 second
  return new Promise((resolve, reject) => setTimeout(reject, 1000));
});
```

## Running Tests

### Using CLI

```shell
npx unittt [directory] [file-pattern-regex]+
```

* `[directory]` - directory that contains Javascript files
* `[file-pattern-regex]+` - one or more regex patterns, files that match any of these patterns will be included

If you compile TypeScript files to directory `build` and your tests are in files matching glob `*.test.ts`,
then to run all tests you would need to run this command:

```shell
npx unittt build \.test\.js$
```

### Programmatically

1. Import you unit tests
2. Call function `runAllUnitTests` and provide a `TestRunner` that will receive info about tests as they are run
