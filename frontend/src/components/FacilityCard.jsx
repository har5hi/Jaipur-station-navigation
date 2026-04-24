import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const FacilityCard = ({ facility, isActive, onClick, onRouteToggle }) => {
  const [showDirections, setShowDirections] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t, language } = useLanguage();

  // Reset directions view when card is closed
  useEffect(() => {
    if (!isActive) {
      setShowDirections(false);
    }
  }, [isActive]);

  const handleShowDirections = (e) => {
    e.stopPropagation();
    setShowDirections(true);
    if (onRouteToggle) onRouteToggle(true);
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden border ${
        isActive 
          ? 'bg-white shadow-xl shadow-primary/10 border-gray-200 dark:bg-slate-800 dark:border-slate-600' 
          : 'bg-white/80 dark:bg-slate-800/80 shadow-md border-gray-200 dark:border-slate-700 hover:shadow-lg'
      }`}
      onClick={onClick}
    >
      {/* Optional Top Image */}
      {isActive && facility.imageUrl && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 160 }}
          className="w-full rounded-xl overflow-hidden mb-5 shadow-sm relative bg-gray-100 dark:bg-slate-700"
        >
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-xs font-medium">Image unavailable</span>
            </div>
          ) : (
            <>
              <img 
                src={facility.imageUrl} 
                alt={facility.name[language]} 
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  setImageError(true);
                  e.target.src = '/station-default.jpg';
                }}
                className={`w-full h-full object-cover transition-all duration-700 hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
            </>
          )}
        </motion.div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`text-2xl p-2.5 rounded-2xl flex items-center justify-center w-12 h-12 shadow-sm flex-shrink-0 ${isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-gray-200'}`}>
            {facility.icon}
          </div>
          <div>
            <h3 className={`font-bold text-lg leading-tight font-display ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-gray-100'}`}>
              {facility.name[language]}
            </h3>
            <p className={`text-xs font-bold flex items-center mt-1 mb-1 ${isActive ? 'text-primary dark:text-accent' : 'text-gray-700 dark:text-gray-300'}`}>
              <MapPin className="w-3 h-3 mr-1" />
              {facility.type[language]}
            </p>
            {facility.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mt-1.5 font-medium">
                {facility.description[language]}
              </p>
            )}
          </div>
        </div>
        
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)] border border-white"></div>
          </motion.div>
        )}
      </div>
      
      {isActive && !showDirections && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-5 pt-4 border-t border-gray-200/50 dark:border-slate-700/50"
        >
          <button 
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.02] hover:brightness-110 active:scale-95"
            onClick={handleShowDirections}
          >
            <Navigation className="w-4 h-4 mr-2" />
            {t('showDirections')}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FacilityCard;
