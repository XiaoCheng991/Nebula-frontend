"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function ImageLightbox({ revision }: { revision: string }) {
  const markerRef = useRef<HTMLSpanElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    const root = markerRef.current?.parentElement;
    if (!root) return;
    const imagesInArticle = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
    const listeners = imagesInArticle.map((image) => {
      image.style.cursor = "zoom-in";
      const open = () => {
        setImages(imagesInArticle);
        setIndex(imagesInArticle.indexOf(image));
      };
      image.addEventListener("click", open);
      return { image, open };
    });
    return () => {
      listeners.forEach(({ image, open }) => image.removeEventListener("click", open));
    };
  }, [revision]);

  const close = useCallback(() => setIndex(-1), []);
  const step = useCallback((direction: 1 | -1) => {
    setIndex((previous) => {
      if (previous < 0 || images.length === 0) return previous;
      return (previous + direction + images.length) % images.length;
    });
  }, [images.length]);

  useEffect(() => {
    if (index < 0) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };
    const onHide = () => { if (document.hidden) setIndex(-1); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [index, close, step]);

  useEffect(() => {
    if (index < 0) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [index]);

  const current = index >= 0 ? images[index] : undefined;

  return (
    <>
      <span ref={markerRef} hidden />
      {index >= 0 && current && (
        <div
          className="img-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="图片预览"
          onClick={close}
        >
          <img
            src={current.src}
            alt={current.alt || "预览大图"}
            onClick={(event) => event.stopPropagation()}
          />
          <button type="button" className="img-lightbox-close" onClick={close} aria-label="关闭预览">
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="img-lightbox-nav img-lightbox-prev"
                onClick={(event) => { event.stopPropagation(); step(-1); }}
                aria-label="上一张"
              >
                ‹
              </button>
              <button
                type="button"
                className="img-lightbox-nav img-lightbox-next"
                onClick={(event) => { event.stopPropagation(); step(1); }}
                aria-label="下一张"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
