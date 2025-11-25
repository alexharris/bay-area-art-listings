import { useState, useEffect } from 'react';

export default function CityFromPlaceId({ googlePlaceId, fallbackAddress }) {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!googlePlaceId) {
      // Fallback to extracting city from address
      if (fallbackAddress) {
        const parts = fallbackAddress.split(',').map(part => part.trim());
        if (parts.length >= 2) {
          setCity(parts[1]);
        } else {
          setCity(parts[0]);
        }
      }
      return;
    }

    const fetchCityFromPlaceId = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/google-place?placeId=${googlePlaceId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch place details');
        }
        
        const data = await response.json();
        
        // Extract city from Google Places API response
        const cityComponent = data.address_components?.find(
          component => 
            component.types?.includes('locality') || 
            component.types?.includes('administrative_area_level_2')
        );
        
        if (cityComponent) {
          setCity(cityComponent.longText || cityComponent.shortText);
        } else {
          // Fallback to address parsing
          if (fallbackAddress) {
            const parts = fallbackAddress.split(',').map(part => part.trim());
            setCity(parts[1] || parts[0]);
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching place details:', err);
        
        // Fallback to address parsing on error
        if (fallbackAddress) {
          const parts = fallbackAddress.split(',').map(part => part.trim());
          setCity(parts[1] || parts[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCityFromPlaceId();
  }, [googlePlaceId, fallbackAddress]);

  if (loading) {
    return <span className="text-sm text-gray-500">Loading...</span>;
  }

  if (error && !city) {
    return <span className="text-sm text-gray-500">City unavailable</span>;
  }

  return <span className="text-sm leading-tight">{city}</span>;
}