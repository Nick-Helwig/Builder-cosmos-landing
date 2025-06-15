import { useState } from "react";

interface InstagramImageProps {
  src: string;
  alt: string;
  className?: string;
}

const InstagramImage = ({ src, alt, className }: InstagramImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fallback image for when Instagram images fail to load
  const fallbackImage =
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

  const handleImageLoad = () => {
    setLoading(false);
    console.log("Instagram image loaded successfully:", src);
  };

  const handleImageError = () => {
    console.warn(
      "Instagram image failed to load:",
      src,
      "Retry count:",
      retryCount,
    );

    if (retryCount < 2) {
      // Try different URL strategies
      setRetryCount(retryCount + 1);
      return;
    }

    setLoading(false);
    setImageError(true);
  };

  const getImageSrc = () => {
    if (imageError) {
      return fallbackImages[fallbackIndex];
    }
    return src;
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-barber-100 animate-pulse flex items-center justify-center">
          <div className="text-xs text-barber-500">Loading...</div>
        </div>
      )}

      <img
        src={getImageSrc()}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        referrerPolicy="no-referrer"
      />

      {imageError &&
        src &&
        (src.includes("fbcdn.net") || src.includes("instagram")) && (
          <div className="absolute bottom-2 left-2 bg-gold-600/90 text-white text-xs px-2 py-1 rounded">
            Sample work
          </div>
        )}
    </div>
  );
};

export default InstagramImage;
