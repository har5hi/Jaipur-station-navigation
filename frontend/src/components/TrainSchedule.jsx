import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrainFront, Clock, MapPin } from 'lucide-react';
import trainsData from '../data/trains.json';
import { useLanguage } from '../context/LanguageContext';

const TrainSchedule = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrains = trainsData.filter((train) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      train.id.includes(searchLower) ||
      train.name[language].toLowerCase().includes(searchLower) ||
      train.destination[language].toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="glass-panel rounded-3xl h-full p-2 flex flex-col shadow-xl shadow-primary/5">
      <div className="mb-4 pt-4 px-4">
        <h3 className="text-xl font-display font-bold text-gray-800 dark:text-white flex items-center mb-4">
          <TrainFront className="w-6 h-6 mr-2 text-primary dark:text-accent" /> 
          {t('tabTrains')}
        </h3>
        
        <div className="relative w-full">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={t('searchTrains')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/80 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm font-medium text-sm text-gray-700 dark:text-gray-200 placeholder-gray-500 hover:bg-white/80 dark:hover:bg-slate-700/80"
          />
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto custom-scrollbar px-2 flex-1 pb-4">
        {filteredTrains.length > 0 ? (
          filteredTrains.map((train, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={train.id} 
              className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-primary dark:text-accent bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-lg mb-2 inline-block">
                    #{train.id}
                  </span>
                  <h4 className="font-bold text-gray-900 dark:text-white font-display leading-tight">{train.name[language]}</h4>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm border ${
                  train.status.en === 'On Time' || train.status.en === 'Scheduled' 
                    ? 'bg-green-50 dark:bg-green-900/30 text-accent border-green-200 dark:border-green-800' 
                    : train.status.en === 'Arrived'
                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                }`}>
                  {train.status[language]}
                </span>
              </div>
              
              <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-gray-200/50 dark:border-slate-700/50">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 mr-1">{t('destination')}:</span> {train.destination[language]}
                </div>
                <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl border border-white/60 dark:border-slate-700/60 shadow-sm">
                  <div className="flex items-center text-sm text-gray-800 dark:text-gray-200 font-bold">
                    <Clock className="w-4 h-4 mr-2 text-primary dark:text-accent" />
                    {train.departure}
                  </div>
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    <span className="text-gray-500 dark:text-gray-400 font-medium mr-1 text-xs uppercase tracking-wider">{t('platform')}</span> 
                    <span className="bg-white dark:bg-slate-700 px-2 py-1 rounded-md shadow-sm border border-gray-100 dark:border-slate-600">{train.platform}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 font-medium glass-card rounded-2xl">
            No trains found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainSchedule;
