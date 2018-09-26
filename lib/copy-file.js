'use strict';

const fs = require('fs');
const pipe = require('pipe-io');
const {promisify} = require('util');
const tryToCatch = require('try-to-catch');
const wraptile = require('wraptile');
const copySymlink = require('copy-symlink');

const stat = promisify(fs.lstat);
const getMode = (stat) => stat.mode;

const getCopy = (stat, copyFile, copySymlink) => {
    if (stat.isSymbolicLink())
        return copySymlink;
    
    return copyFile;
}

module.exports = async (src, dest, streams = []) => {
    check(src, dest, streams);
    
    const info = await stat(src);
    const copy = getCopy(info, copyFile, copySymlink);
    const [e] = await tryToCatch(copy, src, dest, streams, getMode(info));
    
    if (e)
        return tryToUnlink(dest, e);
}

const tryToUnlink = promisify((dest, error, fn) => {
    fs.unlink(dest, wraptile(fn, error));
});

const copyFile = promisify((src, dest, streams, mode, callback) => {
    const read = fs.createReadStream(src);
    const write = fs.createWriteStream(dest, {
        mode
    });
    
    const allStreams = [read]
        .concat(streams)
        .concat(write);
    
    pipe(allStreams, callback);
});

function check(src, dest, streams) {
    if (typeof src !== 'string')
        throw Error('src should be a string!');
    
    if (typeof dest !== 'string')
        throw Error('dest should be a string!');
    
    if (streams && !Array.isArray(streams))
        throw Error('streams should be an array!');
}

