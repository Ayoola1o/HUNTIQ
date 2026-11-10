export const googleMapsKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();

let mapsReady: Promise<any> | undefined;

export function loadGoogleMaps(key = googleMapsKey): Promise<any> {
  if (!key) return Promise.reject(new Error('Google Maps is not configured.'));
  const existing = (window as any).google?.maps;
  if (existing?.importLibrary) return Promise.resolve(existing);
  if (!mapsReady) {
    mapsReady = new Promise((resolve, reject) => {
      const globals = window as Window & { huntiqGoogleMapsReady?: () => void };
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=huntiqGoogleMapsReady`;
      script.async = true;
      globals.huntiqGoogleMapsReady = () => {
        delete globals.huntiqGoogleMapsReady;
        const maps = (window as any).google?.maps;
        if (maps?.importLibrary) resolve(maps);
        else reject(new Error('Google Maps could not initialize.'));
      };
      script.onerror = () => {
        delete globals.huntiqGoogleMapsReady;
        script.remove();
        reject(new Error('Could not load Google Maps. Check the browser key and its website restrictions.'));
      };
      document.head.appendChild(script);
    }).catch(error => {
      mapsReady = undefined;
      throw error;
    });
  }
  return mapsReady;
}
