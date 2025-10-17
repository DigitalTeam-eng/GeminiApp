
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.sn.dk',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This rule is to solve the "require.extensions is not supported by webpack"
    // error that comes from 'handlebars' and other old packages used by genkit.
    // It tells webpack to use babel-loader to transpile these files.
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', {
            "targets": "defaults"
          }]]
        },
      },
    });

    return config;
  },
};

export default nextConfig;
