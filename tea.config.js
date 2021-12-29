/**
 * Tea 项目配置
 * @type {import("@tencent/tea-types/config").Configuration}
 */
module.exports = {
  command: {
    dev: {
      template: "./public/index.html"
    },
    build: {
      template: "./public/index.html"
    }
  },
  webpack: (config, { webpack }) => ({
    ...config,
    externals: {},
    plugins: [
      ...config.plugins,
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn|ja|ko/)
    ]
  })
};
