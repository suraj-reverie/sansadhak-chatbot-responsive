import toLower from 'lodash/toLower';
import { ReactComponent as Icon1 } from '../assets/botStyle/icon-1.svg';
import { ReactComponent as Icon2 } from '../assets/botStyle/icon-2.svg';
import { ReactComponent as Icon3 } from '../assets/botStyle/icon-3.svg';
import { ReactComponent as Icon4 } from '../assets/botStyle/icon-4.svg';
import { ABUSIVE_WORDS, HINDI_UTTERANCES_MAPPING } from './constants';

export function getBotIcon({ botIconType, styleProps = {}, botIconUrl }) {
  if (botIconUrl) {
    return <img src={botIconUrl} alt="logo" height="80px" width="80px" />;
  } else {
    switch (botIconType) {
      case 'icon1':
        return <Icon1 fill="#426AFB" style={styleProps} />;
      case 'icon2':
        return <Icon2 fill="#426AFB" style={styleProps} />;
      case 'icon3':
        return <Icon3 fill="#426AFB" style={styleProps} />;
      case 'icon4':
        return <Icon4 fill="#426AFB" style={styleProps} />;
      default:
        return <Icon1 fill="#426AFB" style={styleProps} />;
    }
  }
}

export function regexLastIndexOf(string, regex, startpos) {
  let result;
  regex = regex.global
    ? regex
    : new RegExp(
      regex.source,
      'g' + (regex.ignoreCase ? 'i' : '') + (regex.multiLine ? 'm' : '')
    );
  if (typeof startpos == 'undefined') {
    startpos = string.length;
  } else if (startpos < 0) {
    startpos = 0;
  }
  var stringToWorkWith = string.substring(0, startpos + 1);
  var lastIndexOf = -1;
  var nextStop = 0;
  while ((result = regex.exec(stringToWorkWith)) != null) {
    lastIndexOf = result.index;
    regex.lastIndex = ++nextStop;
  }
  return lastIndexOf;
}

export function replaceCharacters({ text, chars = [], replaceChars }) {
  // replace  "ज़ी5" with "ज़ी 5"
  let updatedText = text.replace('ज़ी5', 'ज़ी 5');
  // remove <unknown> from the text
  updatedText = updatedText.replace(/<unknown>/g, '');
  const splitText = updatedText.split(' ');
  const replacedText = splitText.map((char) => {
    const index = chars.findIndex((c) => c.includes(char));
    if (index !== -1) {
      return replaceChars[index];
    }
    return char;
  });
  return replacedText.join('');
}

//function to check if the text is abusive or not.
export function isAbusive({ text, lang }) {
  const abusiveWords = ABUSIVE_WORDS[lang] || [];
  let isAbusiveWord = false;
  abusiveWords
    .map((word) => toLower(word))
    .forEach((word) => {
      if (toLower(text).indexOf(word) !== -1) {
        isAbusiveWord = true;
      }
    });
  return isAbusiveWord;
}

// function to get string and return converted string based on HINDI_UTTERANCES_MAPPING present in constanst.js file
export function getHindiUtterance(utterance) {
  // first divide the utterance into words and if ट्रिपल word is present then in the segment include the next word also
  const words = utterance.split(' ');
  const newWords = [];
  for (let i = 0; i < words.length; i++) {
    if (words[i] === 'ट्रिपल') {
      newWords.push(words[i] + ' ' + words[i + 1]);
      i++;
    }
    else if (words[i] === 'डबल') {
      newWords.push(words[i] + ' ' + words[i + 1]);
      i++;
    }
    else {
      newWords.push(words[i]);
    }
  }

  // now replace the words with the corresponding words present in HINDI_UTTERANCES_MAPPING
  const newUtterance = newWords.map(word => {
    return HINDI_UTTERANCES_MAPPING[word] || word;
  }).join('');

  return newUtterance;
}


// function to return session timeout message based on the language passed
export function getSessionTimeoutMessage(lang) {
  switch (lang) {
    case "en":
      return "Session expired. Please refresh the page.";
    case "hi":
      return "सत्र समाप्त हुआ। कृपया पुन: प्रयास करें.";
    case "bn":
      return "সময় মেয়াদ শেষ. পৃষ্ঠাটি রিফ্রেশ করুন.";
    default:
      return "Session expired. Please refresh the page.";
  }
}