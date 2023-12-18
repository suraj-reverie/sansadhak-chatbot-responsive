import React from 'react';

const LANGUAGES = {
  en: 'English',
  hi: 'हिंदी',
  bn: 'বাংলা',
  as: 'অসমীয়া',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  mr: 'मराठी',
  or: 'ଓଡ଼ିଆ',
  ta: 'தமிழ்',
  pa: 'ਪੰਜਾਬੀ',
  te: 'తెలుగు',
  ar: 'العربية',
};

const SelectLang = ({
  setLanguage,
  langSelected,
  languages = [],
  newIconUrl,
}) => {
  return (
    <div style={{ display: "flex" }}>
      <div
        className="lang-select-container"
        style={{ zIndex: '2' }}
      >
        {languages.map((lang, index) => {
          return (
            <div
              key={index}
              onClick={(e) => setLanguage(lang)}
              className="lang-item"
              style={
                langSelected
                  ? {
                      pointerEvents: "none",
                      color: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(0,0,0,0.5)",
                      wordBreak: "break-word",
                    }
                  : {
                      boxShadow: '0px 2px 4px 0px #00000033',
                      wordBreak: "break-word",
                      background: '#fff'
                    }
              }
            >
              {LANGUAGES[lang]}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectLang;
