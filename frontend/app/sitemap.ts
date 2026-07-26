import type { MetadataRoute } from "next";

const DEFAULT_SITE_URL = "https://neurosnap-vision.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/onboarding`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/journal`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/bio-age`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/reports`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/protocol`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/vision-ai`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/experiments`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/profile`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];
}