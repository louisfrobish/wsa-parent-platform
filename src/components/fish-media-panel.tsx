"use client";

import { useMemo, useState } from "react";
import { getFishImageSet } from "@/lib/fish-images";

type FishMediaPanelProps = {
  fishName: string;
  speciesSlug?: string;
  className?: string;
  compact?: boolean;
};

export function FishMediaPanel({ fishName, speciesSlug, className = "", compact = false }: FishMediaPanelProps) {
  const imageSet = useMemo(() => {
    const base = getFishImageSet(fishName);
    if (!speciesSlug || speciesSlug === base.speciesSlug) return base;

    return {
      ...base,
      speciesSlug,
      heroUrl: `/fish/${speciesSlug}/hero.jpg`,
      guideUrl: `/fish/${speciesSlug}/guide.jpg`,
      gallery: [
        { key: "jump" as const, url: `/fish/${speciesSlug}/jump.jpg`, alt: `${fishName} jumping photo` },
        { key: "caught" as const, url: `/fish/${speciesSlug}/caught.jpg`, alt: `${fishName} caught photo` },
        { key: "underwater" as const, url: `/fish/${speciesSlug}/underwater.jpg`, alt: `${fishName} underwater photo` }
      ]
    };
  }, [fishName, speciesSlug]);

  const [heroFailed, setHeroFailed] = useState(false);
  const [guideFailed, setGuideFailed] = useState(false);
  const [hiddenGalleryKeys, setHiddenGalleryKeys] = useState<string[]>([]);

  const heroSrc = !heroFailed
    ? imageSet.heroUrl
    : !guideFailed
      ? imageSet.guideUrl
      : imageSet.fallbackIllustrationUrl;
  const heroAlt = !heroFailed
    ? `${fishName} species photo`
    : !guideFailed
      ? `${fishName} field-guide graphic`
      : imageSet.fallbackIllustrationAlt;

  return (
    <div className={`fish-media-panel ${compact ? "fish-media-panel-compact" : ""} ${className}`.trim()}>
      <div className="fish-hero-wrap">
        <img
          src={heroSrc}
          alt={heroAlt}
          className="fish-hero-image"
          onError={() => {
            if (!heroFailed) {
              setHeroFailed(true);
              return;
            }

            if (!guideFailed) {
              setGuideFailed(true);
            }
          }}
        />
      </div>

      {!compact ? (
        <>
          {!guideFailed ? (
            <div className="fish-guide-wrap">
              <img
                src={imageSet.guideUrl}
                alt={`${fishName} guide panel`}
                className="fish-guide-image"
                onError={() => setGuideFailed(true)}
              />
            </div>
          ) : null}

          <div className="fish-gallery-grid">
            {imageSet.gallery
              .filter((item) => !hiddenGalleryKeys.includes(item.key))
              .map((item) => (
                <div className="fish-gallery-card" key={item.key}>
                  <img
                    src={item.url}
                    alt={item.alt}
                    className="fish-gallery-image"
                    onError={() => setHiddenGalleryKeys((current) => [...current, item.key])}
                  />
                </div>
              ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
