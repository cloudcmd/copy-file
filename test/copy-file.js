'use strict';

const fs = require('fs');

const test = require('tape');
const tryToCatch = require('try-to-catch');
const copyFile = require('..');
const noop = () => {};
const {promisify} = require('es6-promisify');
const through2 = require('through2');

const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const echo = (chunk, enc, fn) => fn(chunk);

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

