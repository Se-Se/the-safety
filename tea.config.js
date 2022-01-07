/**
 * Tea 项目配置
 * @type {import("@tencent/tea-types/config").Configuration}
 */
module.exports = {
  command: {
    dev: {
      template: './public/index.html',
      proxy: {
        '/api': {
          target: 'https://dev-sec-sandbox.testsite.woa.com',
          https: true,
          secure: false,
          changeOrigin: true,
        },
        '/_sp_login_/': {
          target: 'https://dev-sec-sandbox.testsite.woa.com',
          https: true,
          changeOrigin: true,
          onProxyRes(proxyRes) {
            const cookie = proxyRes.headers['set-cookie'];
            // 将 oa 登录的关联 cookie 保存到本地
            if (cookie) {
              proxyRes.headers['set-cookie'] = cookie.map(i => i.replace(/domain=(.*?);/, ''));
            }
          },
        },
      },
    },
    build: {
      template: './public/index.html',
    },
  },
  webpack: (config, { webpack }) => ({
    ...config,
    externals: {},
    plugins: [...config.plugins, new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn|ja|ko/)],
  }),
};
