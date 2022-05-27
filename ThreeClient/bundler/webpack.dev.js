const { merge } = require('webpack-merge')
const path = require('path')
const commonConfiguration = require('./webpack.common.js')
//const ip = require('internal-ip')
//const portFinderSync = require('portfinder-sync')

const infoColor = (_message) =>
{
    return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`
}

module.exports = merge(
    commonConfiguration,
    {
        mode: 'development',
        devServer:
        {
            host: '0.0.0.0',
            static: {
                directory: path.join(__dirname, '../../dist')
            },
            port: 8080,
            compress: true,
            bonjour: true,
            hot: true,
            open:true,
            client: {
                logging: 'info',
                reconnect: true,
            },

        }
    }
)
