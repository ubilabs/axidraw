const HtmlPlugin = require('html-webpack-plugin');

const entries = [
  'api-test',
  'draw-waves',
  'd3-svg-map',
  'debugger',
  'preview',
  'preview-terrain',
  'adjust-pen',
  'svg-font-test',
  'jsconf-logo',
  'draw-bounds',
  'draw-lorenz',
  'draw-label-only'
];

module.exports = {
  entry: entries.reduce((paths, entry) => {
    paths[entry] = `./src/${entry}.js`;
    return paths;
  }, {}),
  output: {
    path: require('path').resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: entries.map(
    entry =>
      new HtmlPlugin({
        filename: `./${entry}.html`,
        template: `./html/${entry}.html`,
        chunks: [entry]
      })
  ),
  devServer: {
    contentBase: './html'
  }
};
