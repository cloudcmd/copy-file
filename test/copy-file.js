'use strict';

const fs = require('fs');
const {tmpdir} = require('os');
const {join} = require('path');

const test = require('tape');
const tryCatch = require('try-catch');
const tryToCatch = require('try-to-catch');
const copyFile = require('..');
const noop = () => {};
const {promisify} = require('es6-promisify');
const through2 = require('through2');
const rimraf = require('rimraf');
const squad = require('squad');

const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const getErrorStream = require('./fixture/error-stream');

const echo = (chunk, enc, fn) => fn(chunk);
const getEACCESStream = squad(getErrorStream, getEACCESS);

const temp = () => fs.mkdtempSync(join(tmpdir(), 'copy-file-'));

test('copyFile: no args', (t) => {
    t.throws(copyFile, /src should be a string!/, 'should throw when no args');
    t.end();
});

test('copyFile: no dest', (t) => {
    const fn = () => copyFile('/');
    
    t.throws(fn, /dest should be a string!/, 'should throw when no dest');
    t.end();
});

test('copyFile: no callback', (t) => {
    const fn = () => copyFile('/', '/tmp');
    
    t.throws(fn, /callback should be a function!/, 'should throw when no callback');
    t.end();
});

test('copyFile: no callback', (t) => {
    const fn = () => copyFile('/', '/tmp', 'hi', noop);
    
    t.throws(fn, /streams should be an array!/, 'should throw when no args');
    t.end();
});

test('copyFile: not a file', async (t) => {
    const _copyFile = promisify(copyFile);
    const src = '/';
    const dest = '/world';
    
    const [e] = await tryToCatch(_copyFile, src, dest);
    
    t.equal(e.code, 'EISDIR', 'should equal');
    
    t.end();
});

test('copyFile: createWriteStream', async (t) => {
    const _copyFile = promisify(copyFile);
    const _stat = promisify(fs.stat);
    
    const {createWriteStream} = fs;
    
    fs.createWriteStream = sinon.stub().returns(through2(echo));

    const src = '/';
    const dest = '/world';
    
    await tryToCatch(_copyFile, src, dest);
    
    const {mode} = await _stat(src);
    
    t.ok(fs.createWriteStream.calledWith(dest, {mode}), 'should call createWriteStream');
    
    fs.createWriteStream = createWriteStream;
    
    t.end();
});

test('copyFile: no src', async (t) => {
    const _copyFile = promisify(copyFile);

    const src = '/hello-world-copy-file';
    const dest = '/world';
    
    const [e] = await tryToCatch(_copyFile, src, dest);
    
    t.equal(e.code, 'ENOENT', 'should equal');
    
    t.end();
});

test('copyFile: src: EACCESS', async (t) => {
    const src = '/boot/System.map-4.4.0-122-generic1'
    const tmpdir = temp();
    const dest = `${tmpdir}/EACCESS`;
    
    const {
        createReadStream,
        stat,
    } = fs;
    
    fs.stat = (_, fn) => fn(null, {
        mod: 777
    });
    
    fs.createReadStream = getEACCESStream(src);
    
    const _copyFile = promisify(rerequire('..'));
    
    await tryToCatch(_copyFile, src, dest);
    const [e] = tryCatch(fs.statSync, dest);
    
    fs.stat = stat;
    fs.createReadStream = createReadStream;
    rimraf.sync(tmpdir);
    
    t.equal(e && e.code, 'ENOENT', 'should call unlink');
    t.end();
});

test('copyFile', async (t) => {
    const src = __filename;
    const tmp = temp();
    const dest = `${tmp}/copy`;
    
    const _copyFile = promisify(rerequire('..'));
    
    await tryToCatch(_copyFile, src, dest);
    const [e] = tryCatch(fs.statSync, dest);
    
    rimraf.sync(tmp);
    
    t.notOk(e, 'should copy file');
    t.end();
});

function getEACCESS(path) {
    return {
        Error: `EACCES: permission denied, open '${path}`,
        errno: -13,
        code: 'EACCES',
        syscall: 'open',
        path
    }
}

function rerequire(name) {
    delete require.cache[require.resolve(name)];
    return require(name);
}

process.on('unhandledRejection', console.log);
