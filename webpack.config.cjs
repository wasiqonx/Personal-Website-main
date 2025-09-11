// Custom webpack configuration for Next.js
// This file configures webpack for the Next.js application

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add any custom webpack configuration here if needed
    // For now, keeping it minimal to avoid conflicts with Next.js

    // Example: Add custom loader or plugin if needed
    // config.module.rules.push({
    //   test: /\.custom$/,
    //   use: 'custom-loader'
    // });

    return config;
  },
};