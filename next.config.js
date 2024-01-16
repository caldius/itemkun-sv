/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  swcMinify: true,
  experimental: { appDir: true },
  // TODO:ここ静的出力したい場合どうしたらいいのか不明
  // async rewrites() {
  //   return [
  //     {
  //       source: "/hogera",
  //       destination: "https://api.battle.pokemon-home.com/tt/cbd/competition/rankmatch/list",
  //     },
  //   ];
  // },
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         { key: "Access-Control-Allow-Credentials", value: "true" },
  //         { key: "Access-Control-Allow-Origin", value: "*" },
  //         { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
  //         {
  //           key: "Access-Control-Allow-Headers",
  //           value:
  //             "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
