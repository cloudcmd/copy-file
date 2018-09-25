'use strict';

const fs = require('fs');
const pipe = require('pipe-io');
const promisify = require('es6-promisify').promisify;
const tryToCatch = require('try-to-catch/legacy');
const wraptile = require('wraptile/legacy');

const stat = promisify(fs.stat);
const getMode = (stat) => stat.mode;

module.exports = async (src, dest, streams = []) => {
    check(src, dest, streams);
    
    const info = await stat(src);
    const [e] = await tryToCatch(copyFiles, src, dest, streams, getMode(info));
     
    if (e)
        return tryToUnlink(dest, e);
}

const tryToUnlink = promisify((dest, error, fn) => {
    fs.unlink(dest, wraptile(fn, error));
});

const copyFiles = promisify((src, dest, streams, mode, callback) => {
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

