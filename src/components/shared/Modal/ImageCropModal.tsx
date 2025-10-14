import React, { useCallback, useEffect, useRef, useState } from "react";
import ModalData from "@/components/shared/Modal/ModalData";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (dataUrl: string) => void;
  title?: string;
}

type Point = { x: number; y: number };

export default function ImageCropModal({
  isOpen,
  onClose,
  onApply,
  title = "Upload & Crop Image",
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [minZoom, setMinZoom] = useState<number>(0.1);
  const [maxZoom, setMaxZoom] = useState<number>(3);
  const CIRCLE_RATIO = 1; // circle uses full container

  useEffect(() => {
    if (!isOpen) {
      // reset state when closing
      setImageSrc("");
      setImgEl(null);
      setIsDragging(false);
      setDragStart(null);
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const getRelativePoint = (clientX: number, clientY: number): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart(getRelativePoint(e.clientX, e.clientY));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    const current = getRelativePoint(e.clientX, e.clientY);
    const dx = current.x - dragStart.x;
    const dy = current.y - dragStart.y;
    setOffset((prev) => clampOffset({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart(current);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageSrc) return;
    const t = e.touches[0];
    setIsDragging(true);
    setDragStart(getRelativePoint(t.clientX, t.clientY));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStart) return;
    const t = e.touches[0];
    const current = getRelativePoint(t.clientX, t.clientY);
    const dx = current.x - dragStart.x;
    const dy = current.y - dragStart.y;
    setOffset((prev) => clampOffset({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart(current);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!imageSrc) return;
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((z) => {
      const next = Math.max(minZoom, Math.min(maxZoom, z + delta));
      // keep image centered by clamping offset after zoom change
      setOffset((prev) => clampOffset(prev, next));
      return next;
    });
  };

  // Recalculate zoom bounds whenever the image or container is ready
  useEffect(() => {
    if (!imgEl || !containerRef.current) return;
    const iw = imgEl.naturalWidth || 0;
    const ih = imgEl.naturalHeight || 0;
    if (!iw || !ih) return;

    const rect = containerRef.current.getBoundingClientRect();
    const previewSize = Math.min(rect.width, rect.height);
    const visibleDiameter = previewSize * CIRCLE_RATIO;

    // Smallest scale at which the image COVERS the visible circle (no blank areas)
    const computedMinZoom = Math.max(
      visibleDiameter / iw,
      visibleDiameter / ih,
    );
    const safeMin = Math.max(0.01, computedMinZoom);
    const safeMax = Math.max(3, safeMin * 8); // allow much closer zoom in
    setMinZoom(safeMin);
    setMaxZoom(safeMax);
    setZoom(safeMin);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  }, [imgEl, imageSrc]);

  // Ensure the image never exposes blank space inside the circle
  const clampOffset = (proposed: Point, z?: number): Point => {
    if (!imgEl || !containerRef.current) return proposed;
    const iw = imgEl.naturalWidth;
    const ih = imgEl.naturalHeight;
    const rect = containerRef.current.getBoundingClientRect();
    const visibleDiameter = Math.min(rect.width, rect.height) * CIRCLE_RATIO;
    const currentZoom = z ?? zoom;

    const halfW = (iw * currentZoom) / 2;
    const halfH = (ih * currentZoom) / 2;
    const maxOffsetX = Math.max(0, halfW - visibleDiameter / 2);
    const maxOffsetY = Math.max(0, halfH - visibleDiameter / 2);

    return {
      x: Math.min(maxOffsetX, Math.max(-maxOffsetX, proposed.x)),
      y: Math.min(maxOffsetY, Math.max(-maxOffsetY, proposed.y)),
    };
  };

  const applyCrop = useCallback(() => {
    if (!imageSrc || !imgEl || !containerRef.current) return;

    const iw = imgEl.naturalWidth;
    const ih = imgEl.naturalHeight;

    // Get container size (the preview area)
    const rect = containerRef.current.getBoundingClientRect();
    const previewSize = Math.min(rect.width, rect.height);
    const visibleDiameter = previewSize * CIRCLE_RATIO;

    // Create a fixed-size high-quality output (512x512 circle)
    const outputSize = 512;
    const radius = outputSize / 2;

    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Translate to center and apply transformations using PREVIEW pixel space.
    // Map preview pixels → output pixels by scaling with outputSize / visibleDiameter.
    const unitScale = outputSize / visibleDiameter;
    ctx.translate(radius + offset.x * unitScale, radius + offset.y * unitScale);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom * unitScale, zoom * unitScale);

    // Draw image centered, scaled to match full original quality
    ctx.drawImage(imgEl, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onApply(base64data);
          onClose();
        };
        reader.readAsDataURL(blob);
      },
      "image/png",
      1.0,
    );
  }, [imageSrc, imgEl, offset.x, offset.y, rotation, zoom, onApply, onClose]);

  return (
    <ModalData
      isModalOpen={isOpen}
      modalClose={onClose}
      modalTitle={title}
      buttons={[
        {
          btnText: "Cancel",
          buttonCss: "py-1.5 px-5",
          btnClick: onClose,
        },
        {
          btnText: "Done & Save",
          buttonCss: "py-1.5 px-5",
          btnClick: applyCrop,
        },
      ]}
      childclass="py-0"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="border py-1 px-3 rounded border-primary"
          />
        </div>

        <div
          ref={containerRef}
          className="relative w-[240px] h-[240px] bg-gray-100 rounded-full overflow-hidden select-none object-cover border"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt="to-crop"
              ref={(el) => setImgEl(el)}
              className="absolute left-1/2 top-1/2 will-change-transform cursor-grab"
              style={{
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: "center center",
                maxWidth: "none",
              }}
              draggable={false}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="text-sm mb-1">Zoom</div>
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={0.01}
              value={zoom}
              onChange={(e) => {
                const next = parseFloat(e.target.value);
                setZoom(next);
                setOffset((prev) => clampOffset(prev, next));
              }}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <div className="text-sm mb-1">Rotate</div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </ModalData>
  );
}
