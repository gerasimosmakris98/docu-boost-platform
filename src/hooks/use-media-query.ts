
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if window is defined (for SSR)
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia(query);
      const handleChange = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Add event listener for changes
      mediaQuery.addEventListener("change", handleChange);

      // Check initial value
      setMatches(mediaQuery.matches);

      // Cleanup
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }
  }, [query]);

  return matches;
}
