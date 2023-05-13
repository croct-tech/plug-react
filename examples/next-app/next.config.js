/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CROCT_APP_ID: process.env.NEXT_PUBLIC_CROCT_APP_ID,
    CROCT_API_KEY: process.env.CROCT_API_KEY,
  },
};

module.exports = nextConfig;
