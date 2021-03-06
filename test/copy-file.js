'use strict';

const fs = require('fs');
const {stat} = fs.promises;
const {tmpdir} = require('os');
const {join} = require('path');

const test = require('supertape');
const tryCatch = require('try-catch');
const tryToCatch = require('try-to-catch');
const through2 = require('through2');
const rimraf = require('rimraf');
const squad = require('squad');
const stub = require('@cloudcmd/stub');

const {reRequire} = require('mock-require');

const copyFile = require('..');

const getErrorStream = require('./fixture/error-stream');

const echo = (chunk, enc, fn) => fn(chunk);
const getEACCESStream = squad(getErrorStream, getEACCESS);

const temp = () => fs.mkdtempSync(join(tmpdir(), 'copy-file-'));

test('copyFile: no args', async (t) => {
    const [e] = await tryToCatch(copyFile);
    
    t.equal(e.message, 'src should be a string!', 'should throw when no args');
    t.end();
});

test('copyFile: no dest', async (t) => {
    const [e] = await tryToCatch(copyFile, '/');
    
    t.ok(e.message, 'dest should be a string!', 'should throw when no dest');
    t.end();
});

test('copyFile: no callback', async (t) => {
    const [e] = await tryToCatch(copyFile, '/', '/tmp', 'hi');
    
    t.equal(e.message, 'streams should be an array!', 'should throw when no args');
    t.end();
});

test('copyFile: not a file', async (t) => {
    const src = '/';
    const dest = '/world';
    
    const [e] = await tryToCatch(copyFile, src, dest);
    
    t.ok(/^E(ACCES|ISDIR)$/.test(e.code), 'should equal');
    t.end();
});

test('copyFile: createWriteStream', async (t) => {
    const {createWriteStream} = fs;
    
    const getStream = () => Object.defineProperty(through2(echo), 'removeListener', {
        value: stub(),
    });
    
    const createWriteStreamStub = stub()
        .returns(getStream());
    
    fs.createWriteStream = createWriteStreamStub;
    
    const src = '/';
    const dest = '/world';
    
    const copyFile = reRequire('..');
    await tryToCatch(copyFile, src, dest);
    
    const {mode} = await stat(src);
    
    fs.createWriteStream = createWriteStream;
    
    t.calledWith(createWriteStreamStub, [dest, {mode}], 'should call createWriteStream');
    t.end();
});

test('copyFile: createWriteStream: symlink', async (t) => {
    const {createWriteStream} = fs;
    
    const {lstat} = fs.promises;
    
    const getStream = () => Object.defineProperty(through2(echo), 'removeListener', {
        value: stub(),
    });
    
    const createWriteStreamStub = stub()
        .returns(getStream());
    
    fs.promises.lstat = async () => ({
        isSymbolicLink: stub()
            .returns(true),
    });
    
    fs.createWriteStream = createWriteStreamStub;
    
    const src = '/';
    const dest = '/world';
    
    const copyFile = reRequire('..');
    await tryToCatch(copyFile, src, dest);
    
    fs.createWriteStream = createWriteStream;
    fs.promises.lstat = lstat;
    
    t.notOk(createWriteStreamStub.called, 'should call createWriteStream');
    t.end();
});

test('copyFile: no src', async (t) => {
    const src = '/hello-world-copy-file';
    const dest = '/world';
    
    const [e] = await tryToCatch(copyFile, src, dest);
    
    t.equal(e.code, 'ENOENT', 'should equal');
    t.end();
});

test('copyFile: src: EACCESS', async (t) => {
    const src = '/boot/System.map-4.4.0-122-generic1';
    const tmpdir = temp();
    const dest = `${tmpdir}/EACCESS`;
    
    const {
        createReadStream,
        stat,
    } = fs;
    
    fs.stat = (_, fn) => fn(null, {
        mod: 777,
    });
    
    fs.createReadStream = getEACCESStream(src);
    
    const copyFile = reRequire('..');
    await tryToCatch(copyFile, src, dest);
    const [e] = tryCatch(fs.statSync, dest);
    
    fs.stat = stat;
    fs.createReadStream = createReadStream;
    rimraf.sync(tmpdir);
    
    t.equal(e?.code, 'ENOENT', 'should call unlink');
    t.end();
});

test('copyFile', async (t) => {
    const src = __filename;
    const tmp = temp();
    const dest = `${tmp}/copy`;
    
    const copyFile = reRequire('..');
    
    await tryToCatch(copyFile, src, dest);
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
        path,
    };
}

process.on('unhandledRejection', console.log);

