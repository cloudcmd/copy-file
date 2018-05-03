const {Readable} = require('stream');

module.exports = (error) => () => {
    return new Readable({
        read(size) {
            process.nextTick(() => this.emit('error', error));
        }
    });
};


