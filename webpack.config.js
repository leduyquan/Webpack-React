const path = require('path');
const autoprefixer = require('autoprefixer');
const CleanPlugin = require('clean-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production'; //môi trường window thì cần thêm cross-env plugin để set env

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: devMode ? '[name].bundle.js' : '[name].[hash:8].bundle.js', //chuỗi hash chỉ gồm 8 ký tự. hash: các file đều trùng hash
        chunkFilename: devMode ? '[name].chunk.js' : '[name].[hash:8].chunk.js',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.js', '.css', '.scss', '.json'], //bỏ đuổi file khi import
    },
    module: {
        rules: [
            {
                test: /\.js$/, //convert code trong file .js thành vanilla js
                exclude: /node_modules/, //không transform js trong node_modules
                loader: 'babel-loader',
            },
            {
                test: /\.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader,  //style-loader import json css to DOM
                    {
                        loader: 'css-loader', //read and convert to json css
                        options: {
                            importLoaders: 1, //file a.css import b.css, apply autoprefixer for both
                            modules: {
                                localIdentName: '[name]__[local]__[hash:base64:5]', //template for css module
                            },
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: () => [autoprefixer()]  //auto -moz, -o, -webkit trong css
                        }
                     },
                    'sass-loader', //convert to css
                ],
                include: /\.module\.(css|scss)$/,
            },
            {
                test: /\.s?css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                exclude: /\.module\.(css|scss)$/,
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                loader: 'url-loader?limit=8000&name=assets/images/[name].[ext]'
            },
            {
                test: /\.(ttf|eot|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=500&name=assets/fonts/[name].[ext]'
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=500&mimetype=application/font-woff&name=assets/fonts/[name].[ext]'
            }
        ],
    },
    devtool: devMode ? 'eval-cheap-module-source-map' : false,

    devServer: {
        //hot, inline, liveReload are default true
        contentBase: './public', //path to html of webpack-dev-server
        port: 4000
    },
    plugins: [
        new CleanPlugin.CleanWebpackPlugin(), //clean những file ko sử dụng trong dist
        new HtmlWebpackPlugin({
            inject: true,
            template: __dirname + '/public/index.html', //auto create and import bundle js into html
        }),
        new MiniCssExtractPlugin({
            //gom tất cả css vào trong 1 file
            filename: devMode ? '[name].css' : '[name].[contenthash:8].css',
            chunkFilename: devMode ? '[name].css' : '[name].[contenthash:8].chunk.css',
        }),
    ],
    optimization: {
        runtimeChunk: 'single',
        //default đã sử dụng TerserJSPlugin nhưng muốn minimizer nên phải override TerserJSPlugin
        minimizer: [new TerserJSPlugin({extractComments: false,}), new OptimizeCSSAssetsPlugin({})],
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                reactVendor: {
                    test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                    name: 'react',
                },
                utilityVendor: {
                    test: /[\\/]node_modules[\\/](lodash|moment|moment-timezone)[\\/]/,
                    name: 'utility',
                },
                bootstrapVendor: {
                    test: /[\\/]node_modules[\\/](react-bootstrap)[\\/]/,
                    name: 'bootstrap',
                },
                vendor: {
                    test: /[\\/]node_modules[\\/](!react-bootstrap)(!lodash)(!moment)(!moment-timezone)[\\/]/,
                    name: 'vendor',
                },
            },
        },
    },
};
