const HtmlPlugin = require('html-webpack-plugin');
const path = require('path')

const entries = [
  'adjust-pen',
  'draw-bounds',
  // 'draw-map',
  // 'draw-terrain',
  'draw-lorenz',
  // 'draw-jsconf-logo',
  // 'draw-label-only',
  'snowflakes',
  'burnt-ogre'
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
    contentBase: [
      './html'
    ]
  }
};
