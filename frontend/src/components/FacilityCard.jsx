import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, ListChecks } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const FacilityCard = ({ facility, isActive, onClick, onRouteToggle }) => {
  const [showDirections, setShowDirections] = useState(false);
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
      className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${
        isActive 
          ? 'bg-white/80 backdrop-blur-xl border border-primary/30 shadow-xl shadow-primary/10' 
          : 'glass-card'
      }`}
      onClick={onClick}
    >
      {/* Optional Top Image */}
      {isActive && facility.imageUrl && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 140 }}
          className="w-full rounded-xl overflow-hidden mb-5 shadow-sm"
        >
          <img src={facility.imageUrl} alt={facility.name[language]} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
        </motion.div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`text-2xl p-2.5 rounded-2xl flex items-center justify-center w-12 h-12 shadow-sm flex-shrink-0 ${isActive ? 'bg-gradient-to-br from-primary to-indigo-600 text-white' : 'bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 text-gray-700 dark:text-gray-200'}`}>
            {facility.icon}
          </div>
          <div>
            <h3 className={`font-bold text-lg leading-tight font-display ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
              {facility.name[language]}
            </h3>
            <p className={`text-xs font-semibold flex items-center mt-1 mb-1 ${isActive ? 'text-primary dark:text-accent' : 'text-gray-500 dark:text-gray-400'}`}>
              <MapPin className="w-3 h-3 mr-1" />
              {facility.type[language]}
            </p>
            {facility.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-2 mt-1">
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
            className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
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
