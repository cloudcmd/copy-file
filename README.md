# Copy File [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

Simply copy a file. If an error occurs after the destination file has been opened for writing, `copy-file` will attempt to remove the destination. Correctly copies `symlinks`.

## Install

```
npm i @cloudcmd/copy-file
```

## API

### copyFile(src, dest [, streams])

- `src` `<string>` - source filename to copy
- `dest` `<string>`-  destination filename of the copy operation
- `streams` `<array>`-  file processing streams (optional)

```js
const copyFile = require('@cloudcmd/copy-file');

const ok = () => 'ok';
const error = (e) => e.message;

copyFile('./package.json', './package2.json')
    .then(ok)
    .catch(error)
    .then(console.log);
```

You can use preprocessing `streams` of copied file:

```js
const copyFile = require('@cloudcmd/copy-file');

const zlib = require('zlib');
const gzip = zlib.createGzip();

const ok = () => 'ok';
const error = (e) => e.message;

copyFile('./package.json', './package2.json', [gzip])
    .then(ok)
    .catch(error)
    .then(console.log);
```

You can use `copyFile` with `async-await`:

```js
const tryToCatch = require('try-to-catch');
const copyFile = require('@cloudcmd/copy-file');

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
- [copy-symlink](https://github.com/coderaiser/copy-symlink) - Copy symlink because `fs.copyFile` can't.

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/@cloudcmd/copy-file.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/cloudcmd/copy-file/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/david/cloudcmd/copy-file.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[CoverageIMGURL]:           https://coveralls.io/repos/cloudcmd/copy-file/badge.svg?branch=master&service=github
[NPMURL]:                   https://npmjs.org/package/@cloudcmd/copy-file "npm"
[BuildStatusURL]:           https://travis-ci.org/cloudcmd/copy-file  "Build Status"
[DependencyStatusURL]:      https://david-dm.org/cloudcmd/copy-file "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"
[CoverageURL]:              https://coveralls.io/github/cloudcmd/copy-file?branch=master

