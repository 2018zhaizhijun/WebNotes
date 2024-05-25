/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config, options) => {
    // Important: return the modified config
    config.module.rules.push({
      test: /\.node/,
      use: 'raw-loader',
    });
    config.resolve.alias['@'] = path.resolve(__dirname, 'src/app');
    return config;
  },
};

module.exports = nextConfig;
