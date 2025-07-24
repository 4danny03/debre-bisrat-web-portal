import { imageCache } from "./ImageCache";

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
  blur?: number;
  grayscale?: boolean;
}

/**
 * Image processing service
 * Provides asynchronous image processing and optimization
 */
export class ImageProcessor {
  private static instance: ImageProcessor;
  private workerSupported: boolean;

  private constructor() {
    // Check if Web Workers are supported
    this.workerSupported = typeof Worker !== "undefined";
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor();
    }
    return ImageProcessor.instance;
  }

  /**
   * Load image with optimizations
   */
  public async loadImage(
    src: string,
    options: ImageProcessingOptions = {},
  ): Promise<string> {
    try {
      // Generate cache key based on source and options
      const cacheKey = this.generateCacheKey(src, options);

      // Check cache first
      const cachedImage = imageCache.get(cacheKey);
      if (cachedImage) {
        imageCache.recordHit();
        return cachedImage;
      }

      imageCache.recordMiss();

      // Process image
      const processedSrc = await this.processImage(src, options);

      // Cache the result
      imageCache.set(cacheKey, processedSrc);

      return processedSrc;
    } catch (error) {
      console.error("Error processing image:", error);
      // Return original source on error
      return src;
    }
  }

  /**
   * Process image with given options
   */
  private async processImage(
    src: string,
    options: ImageProcessingOptions,
  ): Promise<string> {
    // For now, we'll just add query parameters for CDN-based optimization
    // In a real implementation, this would use canvas or a web worker to process the image

    // If the source is already a data URL or doesn't support query parameters, return as is
    if (src.startsWith("data:") || src.startsWith("blob:")) {
      return src;
    }

    // Add query parameters for CDN optimization
    const url = new URL(src, window.location.origin);

    if (options.width) url.searchParams.append("w", options.width.toString());
    if (options.height) url.searchParams.append("h", options.height.toString());
    if (options.quality)
      url.searchParams.append("q", options.quality.toString());
    if (options.format) url.searchParams.append("fm", options.format);
    if (options.blur) url.searchParams.append("blur", options.blur.toString());
    if (options.grayscale) url.searchParams.append("grayscale", "true");

    return url.toString();
  }

  /**
   * Generate a cache key for an image and its processing options
   */
  private generateCacheKey(
    src: string,
    options: ImageProcessingOptions,
  ): string {
    return `${src}|${JSON.stringify(options)}`;
  }

  /**
   * Preload an image
   */
  public preloadImage(src: string, options: ImageProcessingOptions = {}): void {
    this.loadImage(src, options).catch((err) => {
      console.warn(`Failed to preload image ${src}:`, err);
    });
  }

  /**
   * Batch preload multiple images
   */
  public preloadImages(
    sources: string[],
    options: ImageProcessingOptions = {},
  ): void {
    sources.forEach((src) => this.preloadImage(src, options));
  }
}

// Export singleton instance
export const imageProcessor = ImageProcessor.getInstance();
