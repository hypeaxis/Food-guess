import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // -----------------------------------------------------------------------
  // Images: currently using native <img> tag (see components/shared/FoodImage.tsx).
  // Food images come from cdn.uwufufu.com (confirmed from BE).
  //
  // To switch to next/image later, uncomment the block below:
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "cdn.uwufufu.com",
  //       pathname: "/selection/**",
  //     },
  //   ],
  // },
  // -----------------------------------------------------------------------
};

export default nextConfig;
