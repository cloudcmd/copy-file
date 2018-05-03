'use strict';

const fs = require('fs');
const pipe = require('pipe-io');
const promisify = require('es6-promisify').promisify;
const zames = require('zames/legacy');
const wraptile = require('wraptile/legacy');

const stat = promisify(fs.stat);
const getMode = (stat) => stat.mode;

module.exports = (src, dest, streams, callback) => {
    if (!callback) {
        callback = streams;
        streams = [];
    }
    
    check(src, dest, streams, callback);
    
    stat(src)
        .then(getMode)
        .then(copyFiles(src, dest, streams))
        .catch(tryToUnlink(dest))
        .then(callback)
        .catch(callback);
}

const tryToUnlink = zames((dest, error, fn) => {
    fs.unlink(dest, wraptile(fn, error));
});


const copyFiles = zames((src, dest, streams, mode, callback) => {
    const read = fs.createReadStream(src);
    const write = fs.createWriteStream(dest, {
        mode
    });
    
    const allStreams = [read]
        .concat(streams)
        .concat(write);
    
    pipe(allStreams, callback);
});

function check(src, dest, streams, callback) {
    if (typeof src !== 'string')
        throw Error('src should be a string!');
    
    if (typeof dest !== 'string')
        throw Error('dest should be a string!');
    
    if (streams && !Array.isArray(streams))
        throw Error('streams should be an array!');
    
    if (typeof callback !== 'function')
        throw Error('callback should be a function!');
}

