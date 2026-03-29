import { findFishSpeciesByName } from "@/lib/fish-species";

export type FishImageSet = {
  speciesSlug: string;
  commonName: string;
  scientificName?: string;
  heroUrl: string;
  guideUrl: string;
  gallery: Array<{
    key: "jump" | "caught" | "underwater";
    url: string;
    alt: string;
  }>;
  fallbackIllustrationUrl: string;
  fallbackIllustrationAlt: string;
};

export function slugifyFishSpecies(fishName: string) {
  return fishName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function getFishImageSet(fishName: string): FishImageSet {
  const species = findFishSpeciesByName(fishName);
  const speciesSlug = species?.slug ?? slugifyFishSpecies(fishName);
  const commonName = species?.commonName ?? fishName;
  const fallbackIllustration = getFallbackIllustration(commonName);

  return {
    speciesSlug,
    commonName,
    scientificName: species?.scientificName,
    heroUrl: `/fish/${speciesSlug}/hero.jpg`,
    guideUrl: `/fish/${speciesSlug}/guide.jpg`,
    gallery: [
      { key: "jump", url: `/fish/${speciesSlug}/jump.jpg`, alt: `${commonName} jumping photo` },
      { key: "caught", url: `/fish/${speciesSlug}/caught.jpg`, alt: `${commonName} caught photo` },
      { key: "underwater", url: `/fish/${speciesSlug}/underwater.jpg`, alt: `${commonName} underwater photo` }
    ],
    fallbackIllustrationUrl: fallbackIllustration.url,
    fallbackIllustrationAlt: fallbackIllustration.alt
  };
}

function getFallbackIllustration(fishName: string) {
  const text = fishName.toLowerCase();

  if (/(striped bass|bluefish|croaker|spot|red drum|white perch)/.test(text)) {
    return {
      url: "/field-guide/big-fish.png",
      alt: `${fishName} coastal field-guide illustration`
    };
  }

  if (/(trout|sunfish|bluegill|crappie|creek chub|perch)/.test(text)) {
    return {
      url: "/field-guide/stream-fish.png",
      alt: `${fishName} stream fish field-guide illustration`
    };
  }

  return {
    url: "/field-guide/big-fish.png",
    alt: `${fishName} fish field-guide illustration`
  };
}
