const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const devServer = (isDev) => (!isDev ? {} : {
    devServer: {
        open: true,
        hot: true,
        port: 7777,
        watchFiles: ['src']
    }
});

const filename = (isDev, file, ext) => `${file}.${isDev ? 'dev' : '[contenthash]'}.${ext}`;

module.exports = ({ development }) => ({
    mode: development ? 'development' : 'production',
    devtool: development ? 'inline-source-map' : false,
    entry: './src/js/script.js',
    output: {
        filename: filename(development, 'bundle', 'js'),
        path: path.resolve(__dirname, 'dist'),
        assetModuleFilename: 'assets/[base]'
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: 'body',
            template: './src/index.html',
            filename: 'index.html'
        }),
        new MiniCssExtractPlugin({
            filename: filename(development, 'style', 'css')
        }),
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/assets/favicon.ico'),
                    to: path.resolve(__dirname, 'dist/assets/favicon.ico')
                },
                {
                    from: path.resolve(__dirname, 'src/assets/poppins-regular.ttf'),
                    to: path.resolve(__dirname, 'dist/assets/poppins-regular.ttf')
                },
            ]
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.s[ac]ss$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            },
            {
                test: /\.mp3$/i,
                type: 'asset/resource'
            }
        ]
    },
    optimization: {
        minimize: !development,
        minimizer: [
            new TerserPlugin({
                test: /\.js$/i
            }),
            new CssMinimizerPlugin({
                test: /\.css$/i,
                minimizerOptions: {
                    preset: [
                        'default',
                        {
                            discardComments: { removeAll: true }
                        }
                    ]
                }
            })
        ]
    },
    ...devServer(development)
});
