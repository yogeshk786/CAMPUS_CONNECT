// utils/profanityFilter.js

// 🤬 The Dictionary: Map bad words to funny/smart CampusConnect alternatives
const dictionary = {
    // 🇬🇧 Standard English
    "fuck": "fluff",
    "shit": "glitch",
    "bitch": "boss",
    "asshole": "sweetheart",
    "crap": "spaghetti code",
    "damn": "darn it",
    "dick": "duck",
    "slut": "scholar",
    "whore": "workaholic",
    "bastard": "beautiful person",
    "idiot": "future CEO",
    "stupid": "creatively challenged",

    // 🇮🇳 Indian Hostel Slang
    "chutiya": "absolute genius",
    "saala": "dear friend",
    "kutta": "good boy",
    "kaminey": "cutie pie",
    "haramkhor": "hardworker",
    "bhenchod": "best coder",
    "bc": "blockchain",
    "madarchod": "master coder",
    "mc": "master coder",
    "gandu": "glorious human",
    "bhosadike": "beautiful soul",
    "ullu": "night owl",

    // 📱 Internet Acronyms & Short Forms
    "wtf": "what the fluff",
    "stfu": "silence please",
    "af": "as fluff",
    "lmfao": "laughing my fluffing apples off",
    "bs": "bad syntax",
    "gtfo": "kindly exit",

    // 🛑 Hate Speech / Racist Slurs (Fill these in locally as needed)
    "n-word-placeholder": "uneducated comment",
    "slur-placeholder-2": "need to read a book",
    "slur-placeholder-3": "kindly grow up"
};

/**
 * Scans text and replaces any word found in the dictionary, 
 * including plurals and common suffixes!
 */
const sanitizeText = (text) => {
    if (!text) return text;

    let cleanText = text;

    for (const [badWord, funnyWord] of Object.entries(dictionary)) {
        // 🛠️ THE FIX: Added a "Non-Capturing Group" for suffixes
        // This catches: word, words, wordes, worder, worders, wording, worded, wordy
        // Example: 'fuck' catches 'fucks', 'fucker', 'fuckers', 'fucking', 'fucked'
        const regex = new RegExp(`\\b${badWord}(?:s|es|er|ers|ing|ed|y)?\\b`, 'gi'); 
        
        cleanText = cleanText.replace(regex, (match) => {
            // Keep the original casing if they shouted (e.g., FUCKERS -> FLUFF)
            if (match === match.toUpperCase()) return funnyWord.toUpperCase();
            
            // Capitalize the first letter if the original word was capitalized (e.g., Bitches -> Boss)
            if (match[0] === match[0].toUpperCase()) {
                return funnyWord.charAt(0).toUpperCase() + funnyWord.slice(1);
            }
            
            // Otherwise, return the standard lowercase replacement
            return funnyWord; 
        });
    }

    return cleanText;
};

module.exports = sanitizeText;