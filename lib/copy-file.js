'use strict';

const fs = require('fs');
const pipe = require('pipe-io');

module.exports = (src, dest, streams, callback) => {
    if (!callback) {
        callback = streams;
        streams = [];
    }
    
    check(src, dest, streams, callback);
    
    fs.stat(src, (error, stat) => {
        if (error)
            return callback(error);
        
        copyFiles(src, dest, stat.mode, streams, callback);
    });
}

function copyFiles(src, dest, mode, streams, callback) {
    const read = fs.createReadStream(src);
    const write = fs.createWriteStream(dest, {
        mode
    });
    
    const allStreams = [read]
        .concat(streams)
        .concat(write);
    
    pipe(allStreams, callback);
}

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

