import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { useLanguage } from '../context/LanguageContext';
import { Play, Square, Navigation2 } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1.25rem'
};

const defaultCenter = { lat: 26.9196, lng: 75.7880 }; // Main Entrance

const StationMap = ({ facilities, activeFacilityId, onMarkerClick, routeEnabled, onRouteCalculated, userLocation, onLocationUpdate, onStartNavigation }) => {
  const { language, t } = useLanguage();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const activeFacility = facilities.find(f => f.id === activeFacilityId);
  const watchIdRef = useRef(null);
  const simulationIntervalRef = useRef(null);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback(mapInstance) {
    setMap(null);
  }, []);

  // 1. Live Geolocation Tracking (watchPosition)
  useEffect(() => {
    if (!isSimulating && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          onLocationUpdate(newPos);
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }
    
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isSimulating, onLocationUpdate]);

  // 2. Simulate Movement Logic
  useEffect(() => {
    if (isSimulating && activeFacility && routeEnabled) {
      const dest = activeFacility.position;
      
      simulationIntervalRef.current = setInterval(() => {
        onLocationUpdate(prev => {
          const latDiff = dest.lat - prev.lat;
          const lngDiff = dest.lng - prev.lng;
          
          if (Math.abs(latDiff) < 0.00001 && Math.abs(lngDiff) < 0.00001) {
            clearInterval(simulationIntervalRef.current);
            setIsSimulating(false);
            return dest;
          }
          
          return {
            lat: prev.lat + latDiff * 0.05,
            lng: prev.lng + lngDiff * 0.05
          };
        });
      }, 1000);
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isSimulating, activeFacility, routeEnabled, onLocationUpdate]);

  // 3. Handle route directions calculation dynamically
  useEffect(() => {
    if (routeEnabled && activeFacility) {
      const directionsService = new window.google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: userLocation,
          destination: activeFacility.position,
          travelMode: window.google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            if (onRouteCalculated) {
              onRouteCalculated(result);
            }
          } else {
            console.error(`Error fetching directions ${result}`);
            setDirections(null);
            if (onRouteCalculated) onRouteCalculated(null);
          }
        }
      );
    } else {
      setDirections(null);
      if (onRouteCalculated) onRouteCalculated(null);
    }
  }, [routeEnabled, activeFacility, userLocation]); // Re-calculates on userLocation change

  // Center map smoothly when active facility changes or user moves
  useEffect(() => {
    if (map && activeFacilityId) {
      if (isSimulating) {
         map.panTo(userLocation);
      } else if (activeFacility) {
        map.panTo(activeFacility.position);
      }
      map.setZoom(19);
    } else if (map && !activeFacilityId) {
      map.panTo(defaultCenter);
      map.setZoom(18);
    }
  }, [map, activeFacilityId, activeFacility, isSimulating, userLocation]);

  const toggleSimulation = () => {
    if (!routeEnabled || !activeFacility) {
      alert("Please select a facility and click 'Show Directions' first!");
      return;
    }
    if (!isSimulating) {
      onLocationUpdate(defaultCenter);
    }
    setIsSimulating(!isSimulating);
  };

  const routeLeg = directions?.routes?.[0]?.legs?.[0];
  const distance = routeLeg?.distance?.text;
  const duration = routeLeg?.duration?.text;

  return isLoaded ? (
    <div className="w-full relative h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={18}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Distance and Duration Overlay */}
        {distance && duration && (
          <div className="absolute top-4 left-4 glass-panel p-4 rounded-2xl z-10 flex flex-col space-y-2 dark:bg-slate-900/80">
            <div className="text-sm font-bold text-gray-800 dark:text-gray-100 flex justify-between items-center">
              <span className="text-primary dark:text-accent mr-4 uppercase text-xs tracking-wider font-semibold">Distance</span> 
              <span>{distance}</span>
            </div>
            <div className="w-full h-px bg-gray-200/50 dark:bg-slate-700/50"></div>
            <div className="text-sm font-bold text-gray-800 dark:text-gray-100 flex justify-between items-center">
              <span className="text-primary dark:text-accent mr-4 uppercase text-xs tracking-wider font-semibold">Est. Time</span> 
              <span>{duration}</span>
            </div>
          </div>
        )}

        {/* Draw Route Line if Directions exist */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              preserveViewport: true,
              polylineOptions: {
                strokeColor: '#2563EB', // Primary Blue
                strokeWeight: 6,
                strokeOpacity: 0.8
              }
            }}
          />
        )}

        {/* Live User Location "Blue Dot" Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#2563EB',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            zIndex={999}
          />
        )}

        {/* Render Facility Markers */}
        {facilities.map((facility) => (
          <Marker
            key={facility.id}
            position={facility.position}
            onClick={() => onMarkerClick(facility.id)}
            animation={activeFacilityId === facility.id ? window.google.maps.Animation.BOUNCE : window.google.maps.Animation.DROP}
          >
            {/* Show Info popup when selected */}
            {activeFacilityId === facility.id ? (
              <InfoWindow onCloseClick={() => onMarkerClick(null)}>
                <div className="p-0 min-w-[220px] max-w-[260px] overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 flex flex-col">
                  {facility.imageUrl && (
                    <div className="w-full h-28 overflow-hidden relative">
                      <img src={facility.imageUrl} alt={facility.name[language]} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                  )}
                  <div className="p-4 flex flex-col items-center text-center">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center justify-center font-display leading-tight">
                      {facility.name[language]}
                    </h3>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{facility.type[language]}</p>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{facility.description[language]}</p>
                    
                    {!routeEnabled && (
                      <button 
                        onClick={() => onStartNavigation(facility.id)}
                        className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-xs py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                      >
                        <Navigation2 className="w-3.5 h-3.5 mr-1" />
                        {t('navigate')}
                      </button>
                    )}
                  </div>
                </div>
              </InfoWindow>
            ) : null}
          </Marker>
        ))}
      </GoogleMap>

      {/* Floating Simulation Toggle Button */}
      <div className="absolute bottom-6 right-6 z-10">
        <button
          onClick={toggleSimulation}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm transition-all border ${
            isSimulating ? 'bg-red-500 hover:bg-red-600 text-white border-red-600 animate-pulse shadow-red-500/20' : 'glass-panel text-gray-800 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-slate-800/80'
          }`}
        >
          {isSimulating ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Simulation</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-accent" />
              <span>Simulate Walking</span>
            </>
          )}
        </button>
      </div>
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl animate-pulse shadow-inner border border-white/50 dark:border-slate-700/50">
      <div className="text-gray-500 dark:text-gray-400 font-bold flex items-center">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
        {t('loadingMap')}
      </div>
    </div>
  );
};

export default React.memo(StationMap);
