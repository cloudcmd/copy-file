# Copy File [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

Simply copy a file. If an error occurs after the destination file has been opened for writing, `copy-file` will attempt to remove the destination.


## Install

```
npm i @cloudcmd/copy-file
```

## API

### copyFile(src, dest [, streams], callback)

- `src` `<string>` - source filename to copy
- `dest` `<string>`-  destination filename of the copy operation
- `streams` `<array>`-  file processing streams (optional)
- `callback` `<function>`-  callback will be called at the end or on when error occures


```js
const copyFile = require('@cloudcmd/copy-file');

copyFile('./package.json', './package2.json', (e) => {
    if (!e)
        return;
    
    console.error(e.message);
});
```

You can use preprocessing `streams` of copied file:

```js
const copyFile = require('@cloudcmd/copy-file');

const zlib = require('zlib');
const gzip = zlib.createGzip();

copyFile('./package.json', './package.gz', [gzip], (e) => {
    if (!e)
        return;
    
    console.error(e.message);
});
```

You can use `copyFile` as a promise:

```js
const {promisify} = require('es6-promisify');
const tryToCatch = require('try-to-catch');
const copyFile = promisify(require('@cloudcmd/copy-file'));

const ok = () => 'ok';
const error = (e) => e.message;

copyFile('./package.json', './package2.json')
    .then(ok)
    .catch(error)
    .then(console.log);
```

You can use `copyFile` as a promise with `async-await`:

```js
const tryToCatch = require('try-to-catch');
const {promisify} = require('es6-promisify');
const copyFile = promisify(require('@cloudcmd/copy-file'));

(async () => {
    const [e] = await tryToCatch(copyFile, './package.json', './package2.json');
    
    if (!e)
        return;
    
    console.error(e.message);
})();
```

## Related

- [fs-copy-file](https://github.com/coderaiser/fs-copy-file "fs-copy-file") - Node.js `v8.5.0` `fs.copyFile` ponyfill
- [fs-copy-file-sync](https://github.com/coderaiser/fs-copy-file-sync "fs-copy-file-sycn") - Node.js `v8.5.0` `fs.copyFile` ponyfill

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/@cloudcmd/copy-file.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/cloudcmd/copy-file/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/cloudcmd/copy-file.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[CoverageIMGURL]:           https://coveralls.io/repos/cloudcmd/copy-file/badge.svg?branch=master&service=github
[NPMURL]:                   https://npmjs.org/package/@cloudcmd/copy-file "npm"
[BuildStatusURL]:           https://travis-ci.org/cloudcmd/copy-file  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/cloudcmd/copy-file "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"
[CoverageURL]:              https://coveralls.io/github/cloudcmd/copy-file?branch=master

