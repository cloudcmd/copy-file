'use strict';

const fs = require('fs');
const {lstat, unlink} = require('fs/promises');
const pipe = require('pipe-io');
const tryToCatch = require('try-to-catch');
const copySymlink = require('copy-symlink');

const getMode = (stat) => stat.mode;

const getCopy = (stat, copyFile, copySymlink) => {
    if (stat.isSymbolicLink())
        return copySymlink;
    
    return copyFile;
};

module.exports = async (src, dest, streams = []) => {
    check(src, dest, streams);
    
    const info = await lstat(src);
    const copy = getCopy(info, copyFile, copySymlink);
    const [e] = await tryToCatch(copy, src, dest, streams, getMode(info));
    
    if (e)
        return tryToUnlink(dest, e);
};

const tryToUnlink = async (dest, error) => {
    await tryToCatch(unlink, dest);
    throw error;
};

const copyFile = async (src, dest, streams, mode) => {
    const read = fs.createReadStream(src);
    const write = fs.createWriteStream(dest, {
        mode,
    });
    
    const allStreams = [read]
        .concat(streams)
        .concat(write);
    
    await pipe(allStreams);
};

function check(src, dest, streams) {
    if (typeof src !== 'string')
        throw Error('src should be a string!');
    
    if (typeof dest !== 'string')
        throw Error('dest should be a string!');
    
    if (streams && !Array.isArray(streams))
        throw Error('streams should be an array!');
}

