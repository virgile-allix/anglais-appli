/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  // GitHub Pages : le site sera à https://virgile-allix.github.io/anglais-appli/
  // Si tu utilises un domaine custom, supprime basePath et assetPrefix.
  basePath: '/anglais-appli',
  assetPrefix: '/anglais-appli/',

  trailingSlash: true,

  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
