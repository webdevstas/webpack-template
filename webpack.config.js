const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

function optimization() {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }
    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetsWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }

}

function filename(ext) {
    return isProd ? `[name].${ext}` : `[name].[contenthash].${ext}`
}

function cssLoaders(extra) {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {}
        },
        {
            loader: 'css-loader',
            options: {
                modules: true
            }
        }
    ]
    if (extra) {
        loaders.push(extra)
    }
    return loaders
}

function plugins() {
    let base = [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: filename('css')
        })
    ]

    if (isProd) {
        base.push(new BundleAnalyzerPlugin)
    }

    return base
}

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: ['@babel/polyfill', './index.js'],
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    optimization: optimization(),
    devtool: isDev ? 'source-map' : false,
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader'
              },
            {
                test: /\.(css)$/,
                use: cssLoaders()
            },
            {
                test: /\.(s[ac]ss)$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpe?g|svg|gif)$/,
                loader: 'file-loader',
                options: {
                    outputPath: './images',
                }
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ['file-loader']
            },
            {
                test: /\.(js)$/,
                exclude: '/node_modules/',
                loader: 'babel-loader',
                options: {
                    presets: [
                        '@babel/preset-env'
                    ],
                    plugins: [
                        '@babel/plugin-proposal-class-properties'
                    ]
                }
            }
        ]
    }
}