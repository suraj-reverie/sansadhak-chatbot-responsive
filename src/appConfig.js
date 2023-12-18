const appConfig = {
    // ttsUrl: 'https://tts.reverieinc.com/bol',
    // ttsHeaders: {
    //     "REV-API-KEY": "39eb39fb8d766e9dde7e2b888fcb145cba8841ef",
    //     "REV-APPNAME": "tts",
    //     "REV-APP-ID": "rev.tts_sansadhak",
    //     "speaker": "en_female",
    //     "Content-Type": "application/json"
    // },
    ttsUrl: 'https://revapi.reverieinc.com/',
    ttsHeaders: {
        'REV-API-KEY': '84148cc0e57e75c7d1b1331bb99a2e94aa588d48',
        'REV-APP-ID': 'rev.stt_tts',
        'REV-APPNAME': 'tts',
        speaker: 'hi_female',
        'Content-Type': 'application/json',
    },
    // Local Url
    // sansadhakEndpoint: 'http://localhost:5000',
    // Prod Url
    sansadhakEndpoint: 'https://sansadhak-dev.reverieinc.com',
    languageMap: {
        as: 'assamese',
        bn: 'bengali',
        en: 'english',
        gu: 'gujarati',
        hi: 'hindi',
        kn: 'kannada',
        ml: 'malayalam',
        mr: 'marathi',
        or: 'odia',
        pa: 'punjabi',
        ta: 'tamil',
        te: 'telugu',
        // "fr": "french",
        // "ru": "russian",
        // "es": "spanish",
        // "de": "german",
    }
}

export default appConfig;