const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const fs = require('fs');

// Auto-discover modules in the node_modules folder that match "m-*" pattern
const findModules = () => {
    const nodeModulesPath = path.resolve(__dirname, 'node_modules');
    const entries = {};

    // Get directories that match "m-*" pattern
    if (fs.existsSync(nodeModulesPath)) {
        const modules = fs.readdirSync(nodeModulesPath)
            .filter(name => name.startsWith('m-') &&
                fs.statSync(path.join(nodeModulesPath, name)).isDirectory());

        // Add each module as an entry point
        modules.forEach(moduleName => {
            entries[moduleName] = {
                import: [moduleName],
                library: {
                    type: 'umd',
                    name: moduleName.replace(/-/g, '_'), // replace dashes with underscores for valid JS variable
                }
            };
        });
    }

    return entries;
};

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    // Explicitly use absolute path to ensure correct output location
    // Use path.resolve with __dirname to get an absolute path
    const wwwrootPath = path.resolve(__dirname, 'wwwroot');
    const outputPath = path.resolve(wwwrootPath, 'dist');

    console.log('Webpack output path:', outputPath);

    return {
        entry: findModules(),
        output: {
            path: outputPath,
            filename: isProduction ? '[name].[contenthash].js' : '[name].js',
            publicPath: '/dist/',
            clean: true
        },
        optimization: {
            minimize: isProduction,
            minimizer: [new TerserPlugin()],
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all'
                    }
                }
            }
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader'
                    ]
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: isProduction ? '[name].[contenthash].css' : '[name].css'
            }),
            new WebpackManifestPlugin({
                fileName: 'asset-manifest.json',
                publicPath: '/dist/',
                generate: (seed, files) => {
                    const manifestFiles = files.reduce((manifest, file) => {
                        manifest[file.name] = file.path;
                        return manifest;
                    }, seed);

                    return {
                        files: manifestFiles
                    };
                }
            })
        ],
        resolve: {
            extensions: ['.js', '.jsx']
        }
    };
};