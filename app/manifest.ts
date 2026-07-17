import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} - İzmir Pet Kuaförü`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fffaf5",
    theme_color: "#ee8c7f",
    lang: "tr-TR",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/icon.png",
        sizes: "32x32",
        type: "image/png"
      }
    ]
  };
}
