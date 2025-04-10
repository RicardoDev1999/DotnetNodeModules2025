const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const fs = require('fs');

// Auto-discover modules in the node_modules folder that match "m-*" pattern
// and create separate entries for JS and CSS
const findModules = () => {
    const nodeModulesPath = path.resolve(__dirname, 'node_modules');
    const entries = {};

    // Get directories that match "m-*" pattern
    if (fs.existsSync(nodeModulesPath)) {
        const modules = fs.readdirSync(nodeModulesPath)
            .filter(name => name.startsWith('m-') &&
                fs.statSync(path.join(nodeModulesPath, name)).isDirectory());

        // Process each module
        modules.forEach(moduleName => {
            const modulePath = path.join(nodeModulesPath, moduleName);
            
            // Set up the main JS entry
            let mainEntry = moduleName;
            const packageJsonPath = path.join(modulePath, 'package.json');
            
            if (fs.existsSync(packageJsonPath)) {
                try {
                    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                    if (packageJson.main) {
                        mainEntry = moduleName; // Keep using the module name for proper library output
                    }
                } catch (e) {
                    console.error(`Error parsing package.json for ${moduleName}:`, e);
                }
            }
            
            // Add the JS entry
            entries[moduleName] = {
                import: [mainEntry],
                library: {
                    type: 'umd',
                    name: moduleName.replace(/-/g, '_'), // replace dashes with underscores for valid JS variable
                }
            };
            
            // Look for CSS files in the module's dist directory
            const distPath = path.join(modulePath, 'dist');
            if (fs.existsSync(distPath)) {
                const distFiles = fs.readdirSync(distPath);
                const cssFiles = distFiles.filter(file => file.endsWith('.css'));
                
                // Create separate entries for each CSS file
                cssFiles.forEach(cssFile => {
                    const cssPath = path.join(distPath, cssFile);
                    const entryName = `${moduleName}-css`;
                    
                    // Create a dedicated entry for CSS
                    entries[entryName] = {
                        import: [cssPath]
                    };
                });
            }
        });
    }

    return entries;
};

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    // Explicitly use absolute path to ensure correct output location
    const wwwrootPath = path.resolve(__dirname, 'wwwroot');
    const outputPath = path.resolve(wwwrootPath, 'dist');
    const modules = findModules();

    console.log(modules);
    console.log('Webpack output path:', outputPath);

    return {
        entry: modules,
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
                        MiniCssExtractPlugin.loader, // Always use MiniCssExtractPlugin for CSS
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
                        const parts = file.name.split('.');
                        const nameWithoutExtension = parts[0];
                        
                        // Only include clean entries in the manifest
                        if (file.name.endsWith('.js') && !nameWithoutExtension.endsWith('-css')) {
                            // Include normal JS files
                            manifest[file.name] = file.path;
                        } else if (file.name.endsWith('.css') && nameWithoutExtension.endsWith('-css')) {
                            // For CSS files, use a cleaner name without the -css suffix
                            const moduleName = nameWithoutExtension.replace(/-css$/, '');
                            manifest[`${moduleName}.css`] = file.path;
                            
                            // Don't include the original -css.css entry
                        } else if (!nameWithoutExtension.endsWith('-css')) {
                            // Include any other files that don't have -css suffix
                            manifest[file.name] = file.path;
                        }
                        
                        return manifest;
                    }, seed);

                    return {
                        files: manifestFiles
                    };
                }
            })
        ],
        resolve: {
            extensions: ['.js', '.jsx', '.css']
        }
    };
};