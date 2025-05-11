/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://fourbit.io',
    generateRobotsTxt: true,
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 5000,
    exclude: ['/api/*', '/admin/*'],
    robotsTxtOptions: {
      additionalSitemaps: [
        `${process.env.NEXT_PUBLIC_SITE_URL}/server-sitemap.xml`,
      ],
      policies: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/api/*', '/admin/*'],
        },
      ],
    },
  };