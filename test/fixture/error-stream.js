const {Readable} = require('stream');

module.exports = (error) => () => {
    return new Readable({
        read() {
            process.nextTick(() => this.emit('error', error));
        }
    });
};


