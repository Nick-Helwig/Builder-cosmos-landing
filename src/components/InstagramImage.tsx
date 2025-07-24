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
  const fallbackImage = `${import.meta.env.VITE_SERVER_URL || "http://localhost:3001"}/fallback-images/fallback_1.jpg`;

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
          console.log("Loading Instagram image via proxy");
        }
      } else {
        // For non-Instagram images, use directly
        setImageSrc(src);
      }
    }
  }, [src, retryCount]);

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
    // Only log successful loads to reduce console noise
    if (retryCount === 0) {
      console.log("✅ Instagram image loaded successfully");
    }
  };

  const handleImageError = () => {
    // Try next proxy if available
    if (retryCount < 2) {
      setRetryCount(retryCount + 1);
      return;
    }

    // All proxies failed, use fallback
    console.log("❌ All proxies failed, using fallback image");
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
