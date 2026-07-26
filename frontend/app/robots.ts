import type { MetadataRoute } from "next";

const DEFAULT_SITE_URL = "https://neurosnap-vision.vercel.app";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}