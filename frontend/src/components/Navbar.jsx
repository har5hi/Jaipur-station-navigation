import React from 'react';
import { LogOut, Map, Languages, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ handleLogout }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/40">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-primary to-indigo-500 p-2.5 rounded-2xl shadow-lg shadow-primary/20">
            <Map className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 hidden sm:block">
            {t('title')}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all border border-white/50 dark:border-slate-700/50 shadow-sm text-gray-700 dark:text-yellow-400"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={toggleLanguage}
            className="flex items-center space-x-2 bg-white/60 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-700/80 px-4 py-2 rounded-full transition-all text-sm font-bold border border-white/50 dark:border-slate-700/50 shadow-sm text-gray-700 dark:text-gray-200 hover:shadow-md"
          >
            <Languages className="w-4 h-4 text-primary dark:text-accent" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 px-5 py-2 rounded-full transition-all font-bold shadow-sm text-sm border border-gray-200 dark:border-slate-700 hover:border-red-100 dark:hover:border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
