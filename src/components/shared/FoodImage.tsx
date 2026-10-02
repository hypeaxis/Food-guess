"use client";

import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// FoodImage — displays a food image with skeleton loading and error fallback
//
// Plan decisions:
// - Uses <img> instead of next/image (Phase 0 — no images.remotePatterns config)
// - Fixed aspect ratio container (Tailwind aspect-square) to prevent layout shift
// - Skeleton placeholder while loading
// - Fallback image on error or empty mediaUrl
// - Can switch to next/image later by only changing this component
//
// Image source: cdn.uwufufu.com (confirmed from BE test)
// ---------------------------------------------------------------------------

const FALLBACK_SRC = "/food-placeholder.jpg";

type FoodImageProps = {
  /** URL of the food image (from snapshot.foodGuessRound.mediaUrl or reveal.resourceUrl) */
  src: string | undefined | null;
  /** Alt text for accessibility */
  alt?: string;
  /** Additional CSS classes for the outer container */
  className?: string;
};

export default function FoodImage({
  src,
  alt = "Món ăn cần đoán",
  className = "",
}: FoodImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const imgSrc = !src || hasError ? FALLBACK_SRC : src;

  return (
    <div
      className={`relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-800 ${className}`}
    >
      {/* Skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-neutral-700 rounded-2xl" />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        draggable={false}
      />
    </div>
  );
}
