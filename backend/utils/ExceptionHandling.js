const { setErrlog } = require("./logger");

module.exports = function () {
    process.on('uncaughtException', (error, origin) => {
        const { name, stack, message } = error
        setErrlog(message, name, stack, origin)
    });

    process.on('unhandledRejection', (error, origin) => {
        const { name, stack, message } = error
        setErrlog(message, name, stack, origin)

    })
}
