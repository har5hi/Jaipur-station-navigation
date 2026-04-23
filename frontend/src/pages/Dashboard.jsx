import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, TrainFront, Navigation, X, Search, Navigation2 } from 'lucide-react';
import StationMap from '../components/StationMap';
import FacilityCard from '../components/FacilityCard';
import TrainSchedule from '../components/TrainSchedule';
import Navbar from '../components/Navbar';
import facilitiesData from '../data/facilities.json';
import { useLanguage } from '../context/LanguageContext';

// Helper function to calculate Haversine distance in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c); 
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Navigation & Map State
  const [activeFacilityId, setActiveFacilityId] = useState(null);
  const [routeEnabled, setRouteEnabled] = useState(false);
  const [apiRouteResult, setApiRouteResult] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 26.9196, lng: 75.7880 }); // Default Main Entrance
  
  // UI State
  const [activeTab, setActiveTab] = useState('navigation');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const { t, language } = useLanguage();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFacilityClick = (id) => {
    setActiveFacilityId(id === activeFacilityId ? null : id);
    setRouteEnabled(false); 
    setApiRouteResult(null);
  };

  const startNavigation = (id) => {
    setActiveFacilityId(id);
    setRouteEnabled(true);
  };

  const cancelNavigation = () => {
    setRouteEnabled(false);
    setApiRouteResult(null);
  };

  // Filter facilities based on search and category
  const filteredFacilities = useMemo(() => {
    return facilitiesData.filter(f => {
      const matchesSearch = f.name[language].toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || f.category === activeCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, language]);

  // Find nearest facilities
  const nearestData = useMemo(() => {
    let nearestToilet = null;
    let nearestFood = null;
    let minToiletDist = Infinity;
    let minFoodDist = Infinity;

    facilitiesData.forEach(f => {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, f.position.lat, f.position.lng);
      if (f.category === 'essentials' && f.type.en === 'Toilet' && dist < minToiletDist) {
        minToiletDist = dist;
        nearestToilet = { ...f, distance: dist };
      }
      if (f.category === 'food' && dist < minFoodDist) {
        minFoodDist = dist;
        nearestFood = { ...f, distance: dist };
      }
    });

    return { nearestToilet, nearestFood };
  }, [userLocation]);

  if (!user) return null;

  const activeFacility = facilitiesData.find(f => f.id === activeFacilityId);
  const routeLeg = apiRouteResult?.routes?.[0]?.legs?.[0];
  const distance = routeLeg?.distance?.text;
  const duration = routeLeg?.duration?.text;
  const apiSteps = routeLeg?.steps || [];

  const categories = ['All', 'Essentials', 'Food', 'Travel', 'Services'];

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-200 transition-colors duration-500">
      <Navbar handleLogout={handleLogout} />
      
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col h-[calc(100vh-80px)]">
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{t('welcome')}, <span className="text-primary dark:text-accent">{user.name}</span>!</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">{t('selectPrompt')}</p>
          </motion.div>

          {/* Clean Tab Controls */}
          <div className="glass-panel rounded-full p-1.5 flex items-center shadow-sm">
            <button 
              onClick={() => setActiveTab('navigation')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTab === 'navigation' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>{t('tabNavigation')}</span>
            </button>
            <button 
              onClick={() => setActiveTab('trains')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTab === 'trains' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <TrainFront className="w-4 h-4" />
              <span>{t('tabTrains')}</span>
            </button>
          </div>
        </div>

        {/* 70/30 SPLIT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-1 min-h-0">
          
          {/* LEFT 70%: MAP (col-span-7) */}
          <div className="lg:col-span-7 h-[500px] lg:h-full relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-white/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-2">
            <div className="w-full h-full rounded-[1.25rem] overflow-hidden">
              <StationMap 
                facilities={facilitiesData} 
                activeFacilityId={activeFacilityId} 
                onMarkerClick={handleFacilityClick}
                routeEnabled={routeEnabled}
                onRouteCalculated={setApiRouteResult}
                userLocation={userLocation}
                onLocationUpdate={setUserLocation}
                onStartNavigation={startNavigation}
              />
            </div>
          </div>

          {/* RIGHT 30%: SIDEBAR (col-span-3) */}
          <div className="lg:col-span-3 h-[600px] lg:h-full flex flex-col min-h-0">
            <AnimatePresence mode="wait">
              {activeTab === 'navigation' ? (
                // Sidebar: Facilities OR Navigation
                <motion.div 
                  key="sidebar-nav"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full w-full"
                >
                  {routeEnabled && apiRouteResult ? (
                    // Live Navigation Mode
                    <div className="glass-panel rounded-3xl h-full flex flex-col overflow-hidden shadow-xl shadow-primary/5">
                      <div className="bg-gradient-to-br from-primary to-indigo-700 text-white p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                          <div>
                            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block tracking-widest shadow-sm uppercase">Live Navigation</span>
                            <h3 className="text-2xl font-display font-bold leading-tight">{activeFacility?.name[language]}</h3>
                          </div>
                          <button onClick={cancelNavigation} className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/20">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="mt-6 flex items-center justify-between bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                          <div className="text-center w-full">
                            <span className="text-indigo-200 block text-xs font-bold uppercase tracking-wider mb-1">Distance</span>
                            <span className="font-bold text-xl">{distance}</span>
                          </div>
                          <div className="w-px h-10 bg-white/20"></div>
                          <div className="text-center w-full">
                            <span className="text-indigo-200 block text-xs font-bold uppercase tracking-wider mb-1">Est. Time</span>
                            <span className="font-bold text-xl">{duration}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                        <h4 className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-4 flex items-center px-2">
                          <Navigation className="w-4 h-4 mr-2 text-primary dark:text-accent" />
                          Turn-by-turn Directions
                        </h4>
                        <div className="space-y-3">
                          {apiSteps.map((step, idx) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              key={idx} 
                              className="flex gap-4 items-start glass-card p-4 rounded-2xl"
                            >
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                {idx + 1}
                              </div>
                              <div className="text-gray-700 dark:text-gray-200 text-sm font-medium leading-relaxed instruction-text pt-1.5" dangerouslySetInnerHTML={{ __html: step.instructions }} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Facilities List
                    <div className="glass-panel rounded-3xl h-full p-2 flex flex-col shadow-xl shadow-primary/5">
                      <div className="p-4 pb-2">
                        <h3 className="text-xl font-display font-bold text-gray-800 dark:text-white mb-4">{t('availableFacilities')}</h3>
                        
                        {/* Nearest Facilities Quick Action */}
                        <div className="flex space-x-2 mb-4">
                           {nearestData.nearestToilet && (
                             <button onClick={() => startNavigation(nearestData.nearestToilet.id)} className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700 p-3 rounded-xl border border-indigo-100 dark:border-slate-600 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow group">
                               <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{nearestData.nearestToilet.icon}</span>
                               <span className="text-xs font-bold text-indigo-900 dark:text-indigo-100">{t('nearestToilet')}</span>
                               <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-semibold">{nearestData.nearestToilet.distance}m</span>
                             </button>
                           )}
                           {nearestData.nearestFood && (
                             <button onClick={() => startNavigation(nearestData.nearestFood.id)} className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-700 p-3 rounded-xl border border-emerald-100 dark:border-slate-600 shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-shadow group">
                               <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{nearestData.nearestFood.icon}</span>
                               <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">{t('nearestFood')}</span>
                               <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-semibold">{nearestData.nearestFood.distance}m</span>
                             </button>
                           )}
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder={t('searchFacilities')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                          />
                        </div>

                        {/* Category Chips */}
                        <div className="flex space-x-2 overflow-x-auto custom-scrollbar pb-2 mb-2">
                          {categories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setActiveCategory(cat)}
                              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                activeCategory === cat 
                                  ? 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900' 
                                  : 'bg-white/50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                              }`}
                            >
                              {t(`cat${cat.replace(' & Shops', '')}`)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 overflow-y-auto custom-scrollbar px-2 flex-1 pb-4">
                        {filteredFacilities.map((facility) => (
                          <FacilityCard 
                            key={facility.id} 
                            facility={facility} 
                            isActive={activeFacilityId === facility.id}
                            onClick={() => handleFacilityClick(facility.id)}
                            onRouteToggle={(enabled) => setRouteEnabled(enabled)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                // Sidebar: Trains Schedule (Replacing the sidebar content)
                <motion.div 
                  key="sidebar-trains"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full w-full"
                >
                  <TrainSchedule />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
