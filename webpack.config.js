var webpack = require("webpack");
var path = require('path');
module.exports = {
    entry: {
        polyfills: ['es6-shim/es6-shim.js', 'reflect-metadata/Reflect.js', 'zone.js/dist/zone.js'],
        app: "./app/boot.ts",
        vendor: ['moment/moment.js']
        // vendor: ['jquery/src/jquery', 'moment/moment.js', 'bootstrap/dist/js/bootstrap.js', './bootstrap-datetimepicker.min.js']
    },
    output: {
        path: __dirname + '/dist',
        filename: "[name].js"
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        loaders: [{
            test: /\.ts$/,
            loaders: ['ts-loader'],
            exclude: /node_modules/
        }]
    }
    // plugins: [
    //     new webpack.ProvidePlugin({
    //         $: "jquery",
    //         jQuery: "jquery"
    //     })
    // ]
};

