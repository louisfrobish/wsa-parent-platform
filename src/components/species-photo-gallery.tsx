"use client";

import { useMemo, useState } from "react";

type SpeciesPhoto = {
  label: string;
  url: string;
  alt: string;
};

type SpeciesPhotoGalleryProps = {
  title: string;
  images: SpeciesPhoto[];
  className?: string;
};

export function SpeciesPhotoGallery({ title, images, className = "" }: SpeciesPhotoGalleryProps) {
  const [hiddenUrls, setHiddenUrls] = useState<string[]>([]);
  const visibleImages = useMemo(
    () => images.filter((image, index) => index === 0 || !hiddenUrls.includes(image.url)),
    [hiddenUrls, images]
  );

  if (!visibleImages.length) return null;

  const [hero, ...gallery] = visibleImages;

  return (
    <div className={`species-photo-gallery ${className}`.trim()}>
      <div className="species-photo-hero">
        <img src={hero.url} alt={hero.alt} className="species-photo-hero-image" />
        <span className="species-photo-label">{hero.label}</span>
      </div>

      {gallery.length ? (
        <div className="species-photo-grid">
          {gallery.map((image) => (
            <article className="species-photo-card" key={`${image.label}-${image.url}`}>
              <img
                src={image.url}
                alt={image.alt}
                className="species-photo-card-image"
                onError={() => setHiddenUrls((current) => [...current, image.url])}
              />
              <div className="species-photo-card-copy">
                <span className="badge">{image.label}</span>
                <p className="muted" style={{ margin: 0 }}>
                  {title}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
