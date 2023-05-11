const webpack = require('webpack');
const path = require('path');
const banner = require('./banner');
const createVariants = require('parallel-webpack').createVariants;

const createConfig = (options) => {
  const fileName = !['var'].includes(options.target) ? `.${options.target}.js` : '.js';

  const outputConfig = {
    path: path.join(__dirname, '../dist'),
    filename: 'litepicker' + fileName,
    library: 'Litepicker',
    libraryTarget: options.target
  }

  if (options.target === 'var') {
    outputConfig.libraryExport = 'Litepicker';
  }

  if (options.target === 'umd') {
    outputConfig.umdNamedDefine = true;
  }

  return {
    entry: path.join(__dirname, '../src/index.ts'),
    output: outputConfig,
  }
}

const multiconfig = createVariants({
  target: ['var', 'commonjs2', 'umd', 'amd']
}, createConfig);

multiconfig.forEach(config => {
  config.module = {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              esModule: false,
              insert: function insertAtTop(element) {
                var parent = document.querySelector('head');
                // eslint-disable-next-line no-underscore-dangle
                var lastInsertedElement = window._lastElementInsertedByStyleLoader;

                if (!window.disableLitepickerStyles) {
                  if (!lastInsertedElement) {
                    parent.insertBefore(element, parent.firstChild);
                  } else if (lastInsertedElement.nextSibling) {
                    parent.insertBefore(element, lastInsertedElement.nextSibling);
                  } else {
                    parent.appendChild(element);
                  }

                  // eslint-disable-next-line no-underscore-dangle
                  window._lastElementInsertedByStyleLoader = element;
                }
              },
            },
          },
          {
            loader: 'dts-css-modules-loader',
            options: {
              namedExport: true
            }
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                exportLocalsConvention: 'camelCaseOnly',
                localIdentName: '[local]'
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              postcssOptions: {
                config: 'postcss.config.js'
              }
            }
          },
          'sass-loader',
        ]
      },
    ]
  };

  config.resolve = {
    extensions: [".ts", ".tsx", ".js"]
  };

  config.plugins = [
    new webpack.BannerPlugin(banner),
  ];
});

module.exports = multiconfig;
