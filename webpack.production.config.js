var path = require('path')
var webpack = require('webpack')
var CopyWebpackPlugin = require('copy-webpack-plugin')

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser-ce/')
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
var pixi = path.join(phaserModule, 'build/custom/pixi.js')
var p2 = path.join(phaserModule, 'build/custom/p2.js')

var definePlugin = new webpack.DefinePlugin({
    __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false')),
})

module.exports = {
    entry: {
        app: [
            'babel-polyfill',
            path.resolve(__dirname, 'src/main.js'),
        ],
        vendor: ['pixi', 'p2', 'phaser', 'webfontloader'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: './dist/',
        filename: 'bundle.js',
    },
    plugins: [
        definePlugin,
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        // FIXME: fix this shit
/*        new webpack.optimize.UglifyJsPlugin({
            drop_console: true,
            minimize: true,
            output: {
                comments: false,
            },
        }),*/
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'/* chunkName= */,
            filename: 'vendor.bundle.js'/* filename= */,
        }),
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, 'index.html'),
            to: path.resolve(__dirname, 'dist'),
        }]),
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, 'src/css'),
            to: path.resolve(__dirname, 'dist/css'),
        }]),
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, 'src/fonts'),
            to: path.resolve(__dirname, 'dist/fonts'),
        }]),
    ],
    module: {
        rules: [
            { test: /\.js[x]$/, use: ['babel-loader'], include: path.join(__dirname, 'src') },
            { test: /pixi\.js/, use: ['expose-loader?PIXI'] },
            { test: /phaser-split\.js$/, use: ['expose-loader?Phaser'] },
            { test: /p2\.js/, use: ['expose-loader?p2'] },
        ],
    },
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            'phaser': phaser,
            'pixi': pixi,
            'p2': p2,
        },
    },
}
