const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const fs = require('fs');

// Check if src/dev directory exists
const devDirExists = fs.existsSync(path.resolve(__dirname, 'src/dev'));

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const shouldAnalyze = Boolean(env && env.analyze);
  
  // Base configuration for both production and development
  const config = {
    entry: './src/index.js',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: "ecmascript",
                  jsx: true
                },
                transform: {
                  react: {
                    runtime: "automatic"
                  }
                }
              }
            }
          }
        }
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    }
  };
  
  if (isProduction) {
    // Production specific configuration
    config.mode = 'production';
    config.output = {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.min.js', // Always output as index.min.js
      library: {
        name: 'mUserInfo',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this',
      clean: true // Clean the output directory before emit
    };
    
    // Add externals for production
    config.externals = {
      'react': {
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'React',
        root: 'React'
      },
      'react-dom': {
        commonjs: 'react-dom',
        commonjs2: 'react-dom',
        amd: 'ReactDOM',
        root: 'ReactDOM'
      },
      'react-redux': {
        commonjs: 'react-redux',
        commonjs2: 'react-redux',
        amd: 'ReactRedux',
        root: 'ReactRedux'
      },
      'redux': {
        commonjs: 'redux',
        commonjs2: 'redux',
        amd: 'Redux',
        root: 'Redux'
      }
    };
    
    // Add optimization for production
    config.optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: { ecma: 8 },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2
            },
            mangle: { safari10: true },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true
            }
          },
          extractComments: false
        })
      ]
    };
    
    // Add bundle analyzer if requested
    config.plugins = [];
    if (shouldAnalyze) {
      config.plugins.push(new BundleAnalyzerPlugin());
    }
  } else {
    // Development specific configuration
    config.mode = 'development';
    config.output = {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      library: {
        name: 'mUserInfo',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this',
      clean: true // Clean the output directory before emit
    };
    
    // Add development plugins
    config.plugins = [
      new HtmlWebpackPlugin({
        template: devDirExists 
          ? path.resolve(__dirname, 'src/dev/index.html')
          : path.resolve(__dirname, 'src/dev-template.html'),
        filename: 'index.html'
      })
    ];
    
    // Add the copy plugin only if dev directory exists
    if (devDirExists) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            { from: './src/dev/demo.js', to: 'demo.js' }
          ]
        })
      );
    }
    
    // Development server configuration
    config.devServer = {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      hot: false,
      port: 3000,
      devMiddleware: {
        writeToDisk: true
      }
    };
  }
  
  return config;
};