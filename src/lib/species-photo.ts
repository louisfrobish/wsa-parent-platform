type ResolveSpeciesPhotoInput = {
  commonName: string;
  scientificName?: string;
  fallbackImageUrl: string;
  fallbackImageAlt: string;
  guideImageUrl?: string;
  guideImageAlt?: string;
  photoLabel?: string;
};

export type ResolvedSpeciesPhoto = {
  imageUrl: string;
  imageAlt: string;
  guideImageUrl: string;
  guideImageAlt: string;
  photoSource?: string;
  usedFallback: boolean;
};

export type SpeciesGalleryImage = {
  label: string;
  url: string;
  alt: string;
};

const speciesPhotoCache = new Map<string, ResolvedSpeciesPhoto>();

export async function resolveSpeciesPhoto({
  commonName,
  scientificName,
  fallbackImageUrl,
  fallbackImageAlt,
  guideImageUrl,
  guideImageAlt,
  photoLabel
}: ResolveSpeciesPhotoInput): Promise<ResolvedSpeciesPhoto> {
  const cacheKey = `${scientificName ?? ""}::${commonName}`.toLowerCase();
  const cached = speciesPhotoCache.get(cacheKey);
  if (cached) return cached;

  const candidates = [scientificName?.trim(), commonName.trim()].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const summary = await fetchWikipediaSummary(candidate, photoLabel ?? commonName);
    if (summary) {
      const resolved = {
        imageUrl: summary.imageUrl,
        imageAlt: summary.imageAlt,
        guideImageUrl: guideImageUrl ?? fallbackImageUrl,
        guideImageAlt: guideImageAlt ?? fallbackImageAlt,
        photoSource: summary.sourceUrl,
        usedFallback: false
      } satisfies ResolvedSpeciesPhoto;
      speciesPhotoCache.set(cacheKey, resolved);
      return resolved;
    }
  }

  const fallback = {
    imageUrl: fallbackImageUrl,
    imageAlt: fallbackImageAlt,
    guideImageUrl: guideImageUrl ?? fallbackImageUrl,
    guideImageAlt: guideImageAlt ?? fallbackImageAlt,
    usedFallback: true
  } satisfies ResolvedSpeciesPhoto;
  speciesPhotoCache.set(cacheKey, fallback);
  return fallback;
}

export function buildSpeciesGallery(options: {
  category: "animal" | "bird" | "fish" | "plant";
  slug: string;
  commonName: string;
  heroImageUrl: string;
  heroImageAlt: string;
  extraImages?: SpeciesGalleryImage[];
}) {
  const categoryLabels: Record<string, string[]> = {
    animal: ["close-up", "juvenile", "habitat"],
    bird: ["male", "female", "juvenile", "habitat"],
    fish: ["side profile", "juvenile", "habitat"],
    plant: ["leaf", "flower", "habitat"]
  };

  const localImages = (categoryLabels[options.category] ?? []).map((label) => {
    const slugLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
      label,
      url: `/species/${options.category}/${options.slug}/${slugLabel}.jpg`,
      alt: `${options.commonName} ${label} photo`
    };
  });

  return [
    {
      label: "hero",
      url: options.heroImageUrl,
      alt: options.heroImageAlt
    },
    ...localImages,
    ...(options.extraImages ?? [])
  ];
}

async function fetchWikipediaSummary(query: string, photoLabel: string) {
  const normalized = query.replace(/\s+/g, "_");
  const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(normalized)}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": process.env.WSA_ENV_DATA_USER_AGENT ?? "WildStallionAcademyAI/1.0"
    },
    next: {
      revalidate: 60 * 60 * 24 * 30
    }
  }).catch(() => null);

  if (!response?.ok) return null;

  const payload = (await response.json()) as {
    title?: string;
    description?: string;
    originalimage?: { source?: string };
    thumbnail?: { source?: string };
    content_urls?: { desktop?: { page?: string } };
  };

  const imageUrl = payload.originalimage?.source ?? payload.thumbnail?.source;
  if (!imageUrl) return null;

  const title = payload.title?.trim() || photoLabel;
  const description = payload.description?.trim();

  return {
    imageUrl,
    imageAlt: description ? `${title} ${description}` : `${title} species photograph`,
    sourceUrl: payload.content_urls?.desktop?.page
  };
}
