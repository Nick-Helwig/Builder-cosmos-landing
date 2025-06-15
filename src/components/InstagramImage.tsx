import { useState, useEffect } from "react";

interface InstagramImageProps {
  src: string;
  alt: string;
  className?: string;
}

const InstagramImage = ({ src, alt, className }: InstagramImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fallback image for final failure
  const fallbackImage =
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

  const proxyServices = [
    // Try our local Vite proxy first for Instagram images
    (url: string) => {
      if (url.includes("fbcdn.net")) {
        const urlParts = url.split("fbcdn.net");
        if (urlParts.length > 1) {
          return `/proxy/instagram-image${urlParts[1]}`;
        }
      }
      return url;
    },
    // Try the original URL
    (url: string) => url,
    // Use allorigins proxy (most reliable)
    (url: string) =>
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    // Use corsproxy.io
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    // Use cors-anywhere (may need activation)
    (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
    // Use thingproxy
    (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
  ];

  useEffect(() => {
    if (src && retryCount < proxyServices.length) {
      const proxiedUrl = proxyServices[retryCount](src);
      setImageSrc(proxiedUrl);
      console.log(
        `Attempt ${retryCount + 1}: Trying to load Instagram image:`,
        proxiedUrl,
      );
    } else if (retryCount >= proxyServices.length) {
      console.log("All proxy attempts failed, using fallback");
      setImageSrc(fallbackImage);
      setError(true);
      setLoading(false);
    }
  }, [src, retryCount]);

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
    console.log(
      `✅ Instagram image loaded successfully on attempt ${retryCount + 1}:`,
      imageSrc,
    );
  };

  const handleImageError = () => {
    console.log(
      `❌ Failed to load image on attempt ${retryCount + 1}:`,
      imageSrc,
    );

    if (retryCount < proxyServices.length - 1) {
      setRetryCount(retryCount + 1);
      setLoading(true);
    } else {
      setLoading(false);
      setError(true);
      setImageSrc(fallbackImage);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-barber-100 animate-pulse flex items-center justify-center">
          <div className="text-xs text-barber-500">
            {retryCount === 0 ? "Loading..." : `Retry ${retryCount}...`}
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
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

      {error && (
        <div className="absolute bottom-2 left-2 bg-amber-600/90 text-white text-xs px-2 py-1 rounded">
          Instagram Proxy Failed
        </div>
      )}

      {!error && retryCount > 0 && !loading && (
        <div className="absolute top-2 right-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded">
          Proxy {retryCount + 1}
        </div>
      )}

      {!error && retryCount === 0 && !loading && src?.includes("fbcdn.net") && (
        <div className="absolute bottom-2 left-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded">
          Live Instagram
        </div>
      )}
    </div>
  );
};

export default InstagramImage;
