// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // loader: "custom",
    // loaderFile: "/src/utils/imageKit.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/march/**",
      },
    ],
  },
};

module.exports = nextConfig;
