/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CLIENT_ID_COOKIE: process.env.CLIENT_ID_COOKIE,
    CROCT_API_KEY: process.env.CROCT_API_KEY,
    NEXT_PUBLIC_CROCT_APP_ID: process.env.NEXT_PUBLIC_CROCT_APP_ID,
  },
};

module.exports = nextConfig;
