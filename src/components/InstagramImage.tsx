import { useState, useEffect } from "react";

interface InstagramImageProps {
  src: string;
  alt: string;
  className?: string;
}

const InstagramImage = ({ src, alt, className }: InstagramImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fallback image for when all proxies fail
  const fallbackImage = "https://cdn.builder.io/api/v1/image/assets%2F5a34583df6fd4e4e8f252df17a4d0333%2F5a810b6046624480a2eb30416f8952db?format=webp&width=400";

  // Multiple proxy services for better reliability
  const getProxiedUrl = (originalUrl: string, attempt: number): string => {
    const proxies = [
      (url: string) =>
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      (url: string) => `https://cors.eu.org/${url}`,
    ];

    if (attempt < proxies.length) {
      return proxies[attempt](originalUrl);
    }
    return fallbackImage;
  };

  useEffect(() => {
    if (src) {
      console.log(`InstagramImage: Received src: ${src}`); // Added log
      // Check if it's an Instagram URL
      const isInstagramUrl =
        src.includes("scontent") ||
        src.includes("fbcdn.net") ||
        src.includes("cdninstagram.com");

      if (isInstagramUrl) {
        const proxiedUrl = getProxiedUrl(src, retryCount);
        setImageSrc(proxiedUrl);
        // Only log on first attempt to reduce console noise
        if (retryCount === 0) {
          console.log(`InstagramImage: Loading Instagram image via proxy: ${proxiedUrl}`); // Modified log
        }
      } else {
        // For non-Instagram images, use directly
        setImageSrc(src);
        console.log(`InstagramImage: Using direct src: ${src}`); // Added log
      }
    }
  }, [src, retryCount]);

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
    console.log(`✅ InstagramImage: Image loaded successfully for src: ${imageSrc}`); // Modified log
  };

  const handleImageError = () => {
    console.log(`❌ InstagramImage: Error loading image for src: ${imageSrc}. Retry count: ${retryCount}`); // Modified log
    // Try next proxy if available
    if (retryCount < 2) {
      setRetryCount(retryCount + 1);
      return;
    }

    // All proxies failed, use fallback
    console.log("❌ InstagramImage: All attempts failed, using hardcoded fallback image."); // Modified log
    setLoading(false);
    setError(true);
    setImageSrc(fallbackImage);
  };

  // Add timeout for loading
  useEffect(() => {
    if (loading && imageSrc) {
      const timeout = setTimeout(() => {
        if (loading) {
          console.log("Instagram image load timeout, trying next proxy");
          handleImageError();
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [loading, imageSrc]);

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-barber-100 animate-pulse flex items-center justify-center">
          <div className="text-xs text-barber-500">
            {retryCount > 0 ? `Trying backup...` : "Loading..."}
          </div>
        </div>
      )}

      <img
        key={`${src}-${retryCount}`} // Force re-render on retry
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default InstagramImage;
