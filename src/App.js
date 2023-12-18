import React, { useEffect, useRef, useState } from "react";
import { Popover } from "antd";
import _, { isEmpty, trim } from "lodash";
import axios from "axios";
import moment from "moment";
import { isMobile } from 'react-device-detect';
import { isIOS } from "react-device-detect";
import { isChrome } from "react-device-detect";

import Chat from "./components/Chat";
import ButtonsMessage from "./components/ButtonsMessage";
import appConfig from "./appConfig";
import "./App.css";
import Typing from "./components/Typing";
import { ChatBotIcon } from "./components/ChatBotIcon";
import { ChatWindowHeader } from "./components/ChatWindowHeader";
import { ChatWindowFooter } from "./components/ChatWindowFooter";
import SelectLang from "./components/SelectLang";
import {
  regexLastIndexOf,
  replaceCharacters,
  isAbusive,
  getHindiUtterance,
  getSessionTimeoutMessage,
} from "./utils/utilFunctions";
import {
  INPUT_LANGUAGES,
  languageToCharacterSet,
  LANGUAGES,
} from "./utils/constants";
import MultipleSelectMessage from "./components/MultipleSelectMessage";
import { speechHandler } from "./utils/SpeechHandler";

// Reverie STT API keys
const sttApiKey = "84148cc0e57e75c7d1b1331bb99a2e94aa588d48";
const sttAppId = "rev.stt_tts";
const sttAppName = "stt_stream";

const { detect } = require('detect-browser');
const browser = detect();

function PoweredByComponent() {
  return <div
    id="powered-by"
    style={{
      // position: "absolute",
      bottom: "0",
      left: "0",
      right: "0",
      height: "2em",
      backgroundColor: "#fff",
      display: "grid",
      placeItems: "center",
      color: "#000",
      zIndex: "10",
    }}
  >
    <span style={{ fontSize: "12px" }}>
      Powered by{" "}
      <a
        href="https://www.reverieinc.com/"
        target="_blank"
        rel="noreferrer"
        style={{ color: "#426AFB" }}
      >
        Reverie
      </a>
    </span>
  </div>;
}

const langSelectMessages = [
  {
    type: "bot",
    text: "Please choose your preferred language",
  },
  {
    type: "select",
  },
];

let socket = undefined;
let audio = new Audio();
let timer = undefined;
let expired = false;

const App = () => {
  const ref = useRef(null);
  const tts = useRef(true);
  const settingNewMessages = useRef(false);
  const details = useRef(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [ttsQueue, setTtsQueue] = useState([]);
  const [uid, setUid] = useState(null);
  const [langSelected, setLangSelected] = useState(false);
  const session = useRef(false);
  const [test, setTest] = useState(false);
  // state variable to track initiating socket and receiving first message
  const [initiatingSocket, setInitiatingSocket] = useState(false);

  const [botStyle, setBotStyle] = useState({});
  const [expireSession, setExpireSession] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [messageQueue, setMessageQueue] = useState([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(35);
  const [shouldSend, setShouldSend] = useState(false);
  const [mozillaSTT, setMozillaSTT] = useState(false);

  const [responseId, setResponseId] = useState(null);

  const isMobileLayout = window.sansadhakBotType === "mobile";

  const chatContainerStyle = {
    opacity: expired ? 0.5 : 1,
    transition: "opacity 0.5s ease",
  };

  console.log("herhe",isIOS);


  // method to add message to message queue
  const enqueueMessage = (message,variable_keyname="") => {
    setMessageQueue((prev) => [...prev, {'message':message,'variable_keyname':variable_keyname}]);
  };

  // method to dequeue message from message queue
  const dequeueMessage = () => {
    const [message, ...rest] = messageQueue;
    setMessageQueue(rest);
    return message;
  };

  const updateResponseId = (newId) => {
    setResponseId(newId);
  };

  window.updateResponseId = updateResponseId;

  function updatePanNumberFormat(replacedText) {
    let updatedText = replacedText;

    // remove <unknown> from the text
    updatedText = updatedText.replace(/<unknown>/g, "");

    // convert the hindi utterances to english
    const resultedData = getHindiUtterance(replacedText);

    // replace the characters if the language is not english
    if (language !== INPUT_LANGUAGES.ENGLISH) {
      updatedText = replaceCharacters({
        text: resultedData,
        chars: languageToCharacterSet[language],
        replaceChars: languageToCharacterSet[INPUT_LANGUAGES.ENGLISH],
      });
    }

    // remove all spaces from PAN number
    updatedText = updatedText.replace(/\s/g, "");

    // convert to uppercase
    updatedText = updatedText.toUpperCase();

    // check if replaced text is PAN number
    if (
      updatedText.length === 10 &&
      updatedText.match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    ) {
      return updatedText;
    } else {
      return replacedText;
    }
  }

  const sendUserMessage = (value) => {
    socket?.send(
      JSON.stringify({
        event: "DATA",
        callSid: uid,
        data: value,
        stt_tag: responseId,
        center_id: "",
        contact: "",
      })
    );
  };

  // function to check if the last bot message was select language
  const checkIfLastBotMessageWasSelectLanguage = () => {
    const lastBotMessage = messages.filter(m => m.type === 'bot')[messages.filter(m => m.type === 'bot').length - 1];
    // check if lastMessage?.text?.toLowerCase() includes any of the LANGUAGE_UTTERANCES
    const LANGUAGE_UTTERANCES = ["please choose your preferred language"];
    const isLanguage = LANGUAGE_UTTERANCES.some((utterance) =>
      lastBotMessage?.text?.toLowerCase().includes(utterance)
    );
    return isLanguage;
  }

  const sendMessage = (value, display) => {
    const testDetails = details.current;
    let text = value ? value : message;
    text = updatePanNumberFormat(text);


    const timestamp = moment(message.timestamp).format("hh:mm A");


    if (
      !uid &&
      typeof text === "string" &&
      (text.toLowerCase() === "english" ||
        text.toLowerCase() === "हिंदी" ||
        text.toLowerCase() === "hindi" ||
        text.toLowerCase() === "punjabi" ||
        text.toLowerCase() === "gujarati" ||
        text.toLowerCase() === "marathi" ||
        text.toLowerCase() === "tamil" ||
        text.toLowerCase() === "telugu" ||
        text.toLowerCase() === "kannada" ||
        text.toLowerCase() === "malayalam" ||
        text.toLowerCase() === "bengali" ||
        text.toLowerCase() === "assamese" ||
        text.toLowerCase() === "odia")
    ) {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: text, timestamp: timestamp },
      ]);
      let newLanguage = "en";
      if (text.toLowerCase() === "हिंदी" || text.toLowerCase() === "hindi") {
        newLanguage = "hi";
      }
      if (text.toLowerCase() === "punjabi") {
        newLanguage = "pa";
      }
      if (text.toLowerCase() === "gujarati") {
        newLanguage = "gu";
      }
      if (text.toLowerCase() === "marathi") {
        newLanguage = "mr";
      }
      if (text.toLowerCase() === "tamil") {
        newLanguage = "ta";
      }
      if (text.toLowerCase() === "telugu") {
        newLanguage = "te";
      }
      if (text.toLowerCase() === "kannada") {
        newLanguage = "kn";
      }
      if (text.toLowerCase() === "malayalam") {
        newLanguage = "ml";
      }
      if (text.toLowerCase() === "bengali") {
        newLanguage = "bn";
      }
      if (text.toLowerCase() === "assamese") {
        newLanguage = "as";
      }
      if (text.toLowerCase() === "odia") {
        newLanguage = "or";
      }

      if (_.includes(details?.current?.languages, newLanguage)) {
        handleLangChange(newLanguage);
      } else {
        showLangSelectBotMessage();
      }
      setMessage("");
      return;
    }

    // if last bot message was select language then show the language select option again
    if (checkIfLastBotMessageWasSelectLanguage()) {
      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          text: display ? display : text,
          timestamp: timestamp,
        },
      ]);
      showLangSelectBotMessage();
      setMessage("");
      // reset the textarea height
      setTextareaHeight(35);
      return;
    }

    const isAbusiveWord = isAbusive({ text, lang: language });
    if (isAbusiveWord) {
      // alert that abusive word is not allowed
      alert("Abusive word is not allowed");
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: display ? display : text,
        timestamp: timestamp,
      },
    ]);
    setMessage("");
    if (!socket) {
      if (message === "english") {
        handleLangChange("en");
      } else if (message === "hindi") {
        handleLangChange("hi");
      }
      scrollToEnd();
      return;
    }
    socket.send(
      JSON.stringify({
        event: "DATA",
        callSid: uid,
        data: text,
        stt_tag: responseId,
        center_id: "",
        contact: "",
      })
    );
    scrollToEnd();
    // reset the textarea height
    setTextareaHeight(35);
  };

  const scrollToEnd = () => {
    setTimeout(() => {
      const box = document.getElementById("chat-container");
      box.scrollTop = box.scrollHeight;
    }, 100);
  };

  const checkButtons = (text) => {
    let newText = text.trim();
    if (!Number.isInteger(parseInt(newText[1]))) return [];
    const firstNum = +newText[1];
    let currentNumber = firstNum;
    let lastNumber = 0;
    let buttons = [];
    let isButtons = false;
    if (newText[0] === "[") {
      isButtons = true;
      const trimmedText = newText.trim();
      const elementArr = trimmedText.split(new RegExp(/\[\d+\]/));
      elementArr.forEach((element, index) => {
        if (index !== 0) {
          const option = element.trim();
          const id = index;
          buttons.push({ id, option });
        }
      });
    }
    return buttons;
  };

  const checkMultiple = (text) => {
    let newText = text.trim();
    if (!Number.isInteger(parseInt(newText[1]))) return [];
    const firstNum = +newText[1];
    let currentNumber = firstNum;
    let lastNumber = 0;
    let buttons = [];
    let isButtons = false;
    if (newText[0] === "(") {
      isButtons = true;
      // const lastIndex = newText.lastIndexOf('(');
      const regex = new RegExp("\\(\\d+\\)", "gi");
      const lastIndex = regexLastIndexOf(newText, regex);
      lastNumber = parseInt(newText[lastIndex + 1]);
      // newText = newText.replaceAll(regex, str => `(${str[1]})`);
      for (let i = firstNum; i <= lastNumber; i++) {
        const id = currentNumber;
        const start = newText.indexOf(`(${currentNumber})`);
        const end = newText.indexOf(`(${currentNumber + 1})`);
        let option;
        if (end !== -1) {
          option = newText.substring(start + 3, end);
        } else {
          option = newText.slice(start + 3);
        }
        option = option.trim();
        buttons.push({ id, option });
        newText.slice(end);
        currentNumber++;
      }
    }
    return buttons;
  };

  function processSocketMessage(message) {
    let updatedText = removeInput(message.message);
    const isButtons = checkButtons(updatedText);
    const isMultiple = checkMultiple(updatedText);
    let newMessage;
    if (updatedText === "End Flow") {
      setMessages((prev) => [
        ...prev.filter((m) => m.type !== "loading"),
      ]);
      setExpireSession(true);
      return;
    } else if (isButtons.length !== 0) {
      newMessage = { type: "buttons", buttons: isButtons };
      updatedText = isButtons.map((b) => b.option).join(". ");
    } else if (isMultiple.length !== 0) {
      newMessage = { type: "multiple", options: isMultiple };
    } else if (updatedText === "$[DELAY-1]") {
      newMessage = { type: "loading" };
    } else if (updatedText.indexOf("[$mozilla]") !== -1) {
      setMozillaSTT(true);
      newMessage = { type: "bot", text: updatedText, timestamp: Date.now(),variable_keyname:message.variable_keyname };
    } else {
      newMessage = { type: "bot", text: updatedText ,variable_keyname:message.variable_keyname};
    }
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== "loading"),
      newMessage,
    ]);
    scrollToEnd();
    // ttsQueue.push(event.data);
    if (updatedText !== "$[DELAY-1]") {
      setTtsQueue((prev) => [...prev, updatedText]);
    }
    // setTimeout(() => {
    //     const box = document.getElementById("chat-box");
    //     box.scrollTop = box.scrollHeight;
    // }, 50)

    if (timer) {
      clearTimeout(timer);
    }
    if (!expired) {
      timer = setTimeout(() => {
        setExpireSession(true);
      }, 120000);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (messageQueue.length > 0) {
        if (isAudioPlaying) return;
        const message = dequeueMessage();
        processSocketMessage(message);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [messageQueue, isAudioPlaying]);

  const initSocket = (newUid, lang) => {
    const testDetails = details.current;
    socket = new WebSocket(
      "wss://sansadhak-response.reverieinc.com/api/chatter"
    );
    let newLang = language;
    if (lang) {
      newLang = lang;
    }

    // check if newLang is present in the details?.current?.languages[0]
    if (
      testDetails?.languages &&
      testDetails.languages.length > 0 &&
      !testDetails.languages.includes(newLang)
    ) {
      newLang = testDetails.languages[0];
    }
    // get the model name based on the language selected from the models list
    const modelName =
      _.find(testDetails?.models, { language: newLang })?.name || "dummy_model";
    socket.onopen = function (e) {
      socket.send(
        JSON.stringify({
          event: "CALL_STARTED",
          callSid: newUid,
          type: "chatty",
          user_id: "",
          center_id: "", // "api_details": apiDetails
          api_details: {
            "REV-APP-ID": "com.domain",
            "REV-APPNAME": "nlu",
            "REV-API-KEY": "732407ffce16f9362f9f0eeb2b5aa5758cd09039",

            PROJECT: testDetails?.projectName || "dummy_project",
            MODEL: modelName,

            // "TEMPLATE": newLang === "en" ? "raj_bot_en_1671610796.992412" : "raj_bot_hi_1671610740.4477355",
            TEMPLATE: testDetails?.templateName, // src_language: testDetails.language,
            src_language: newLang, // send SUPPORT_PROJECT and SUPPORT_MODEL for support chat
            SUPPORT_PROJECT: testDetails?.projectName || "dummy_project",
            SUPPORT_MODEL: modelName,
          },
        })
      );
      // connectedSocket = socket;
      // $("#conversation_id").text(uid);
    };

    socket.onmessage = (event) => {
      setInitiatingSocket(false);
      const jsonObj = JSON.parse(event.data);
      if (jsonObj?.response) {
        // enqueue the response to message queue
        enqueueMessage(jsonObj?.response,jsonObj?.variable_keyname);
      } else {
        // enqueue the message
        enqueueMessage(event.data);
      }
    };

    socket.onclose = function (event) {
      // initSocket(true);
    };

    socket.onerror = (event) => {
    };
  };

  useEffect(() => {
    if (expireSession) {
      setExpireSession(false);
      sendUserMessage("/expire");
      expired = true;
      scrollToEnd();
    }
  }, [expireSession, messages]);

  const removeInput = (message) => {
    return message
      .replace("$[input]", "")
      .replace("$[input] ", "")
      .replace("$[input_otp]", "")
      .replace("$[input_otp] ", "")
      .replace("$[input_choice]", "")
      .replace("$[input_choice] ", "");
  };

  const setContext = (projectId, conversation_id) => {
    axios({
      method: "post",
      url: `${appConfig.sansadhakEndpoint}/api/bot/deploy/context`,
      data: {
        conversation_id,
        projectId,
      },
    }).then((res) => console.log("context", res.data));
  };

  const getRndInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
  };

  const initializeBot = (lang) => {
    const newUid = "chat-" + getRndInteger(1, 100000);
    initSocket(newUid, lang);
    setContext(window.sansadhakProjectId, newUid);
    setUid(newUid);
    setInitiatingSocket(true);

    // reset expired and expireSession
    expired = false;
    setExpireSession(false);
  };

  // useEffect(() => {
  //     if(bot && bot.templateName && testDetails && Object.keys(testDetails).length !== 0) {
  //         initializeBot();
  //     }
  //     return () => {
  //         if(bot && bot.templateName && socket) {
  //             socket.onmessage = null;
  //             socket = null;
  //         }
  //     }
  // }, [bot, testDetails])

  const handleButtonSelect = ({ button, buttons, index }) => {
    // const obj = appConfig.buttons[language];
    // const newValue = Object.keys(obj).filter(v => obj[v] === value)[0];
    sendMessage(button.id + "", button.option);

    setSelectedOptions((prev) => {
      return [...prev, { index, button, buttons }];
    });
    // option is selected to stop the audio
    if (audio && !audio.paused) {
      audio.pause();
      setTtsQueue([]);
    }

    // set isAudioPlaying to false
    setIsAudioPlaying(false);
  };

  const handleMultipleSelect = (button) => {
    const value = button.map((b) => b.id).join(" ");
    const display = button.map((b) => b.option).join(", ");
    sendMessage(value, display);

    // option is selected to stop the audio
    if (audio && !audio.paused) {
      audio.pause();
      setTtsQueue([]);
    }

    // set isAudioPlaying to false
    setIsAudioPlaying(false);
  };

  useEffect(() => {
    if (
      window.sansadhakTestDetails &&
      Object.keys(window.sansadhakTestDetails).length !== 0 &&
      open
    ) {
      details.current = window.sansadhakTestDetails;
      // const { botName, botStatus, botPosition, colors, textConfig } = window.sansadhakStyles.style;
      // setBotName(botName);
      // setBotStatus(botStatus);
      // setBotPosition(botPosition);
      // setColors(colors);
      // setTextConfig(textConfig);
      if (!session.current) {
        initializeChat();
        session.current = true;
      }
    }
    if (window.sansadhakStyles) {
      setBotStyle(window.sansadhakStyles);
    }
    return () => {
      // if(socket) {
      //     socket.onmessage = null;
      //     socket = null;
      // }
    };
  }, [window.sansadhakTestDetails, window.sansadhakStyles, open]);

  const getPopoverPlacement = () => {
    switch (botStyle?.style?.botPosition) {
      case "top-right":
        return "bottomRight";
      case "top-left":
        return "bottomLeft";
      case "middle-right":
        return "left";
      case "middle-left":
        return "right";
      case "bottom-right":
        return "topRight";
      case "bottom-left":
        return "topLeft";
      default:
        return "bottomRight";
    }
  };

  function getSpeaker(lang) {
    const gender = botStyle?.style?.botGender
      ? botStyle?.style?.botGender
      : "female";
    const language = lang ? lang : "en";
    return `${language}_${gender}`;
    // if (lang) {
    //   return `${lang}_`;
    // } else {
    //   return `en_female`;
    // }

    // if (lang) {
    //   return `${lang}_male`;
    // } else {
    //   return `en_male`;
    // }
  }

  const handleTts = (message, value) => {
    if (botStyle?.style?.botVoice === false) {
      return;
    }

    // get the tts provider from the bot test details
    const ttsProvider = details?.current?.ttsProvider;

    const gender = botStyle?.style?.botGender
      ? botStyle?.style?.botGender
      : "female";

    if (ttsProvider) {
      switch (ttsProvider) {
        case "reverie":
          let data = JSON.stringify({
            "text": message
          });
          let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://wrapper-api.reverieinc.com/tts',
            headers: {
              'vendor': 'reverie',
              'gender': gender,
              'lang': language,
              'speed': '1',
              'pitch': '1',
              'Content-Type': 'application/json'
            },
            data: data,
            responseType: "blob",
          };

          axios.request(config)
            .then((response) => {
              if (audio && !audio.paused) {
                return;
              }
              if (!tts.current) return;
              if (!session.current) return;

              audio.src = URL.createObjectURL(response.data);
              audio.load();
              audio.play();
            })
            .catch((error) => {
              console.log(error);
            });
          return;
        case "google":
          let gdata = JSON.stringify({
            "text": message
          });
          let gconfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://wrapper-api.reverieinc.com/tts',
            headers: {
              'vendor': 'google',
              'gender': gender,
              'lang': language,
              'speed': '1',
              'pitch': '1',
              'Content-Type': 'application/json'
            },
            data: gdata,
            responseType: "blob",
          };

          axios.request(gconfig)
            .then((response) => {

              if (audio && !audio.paused) {
                return;
              }
              if (!tts.current) return;
              if (!session.current) return;

              audio.src = URL.createObjectURL(response.data);
              audio.load();
              audio.play();
            })
            .catch((error) => {
              console.log(error);
            });

          return;

        case "microsoft":
          let mdata = JSON.stringify({
            "text": message
          });
          let mconfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://wrapper-api.reverieinc.com/tts',
            headers: {
              'vendor': 'google',
              'gender': gender,
              'lang': language,
              'speed': '1',
              'pitch': '1',
              'Content-Type': 'application/json'
            },
            data: mdata,
            responseType: "blob",
          };

          axios.request(mconfig)
            .then((response) => {

              if (audio && !audio.paused) {
                return;
              }
              if (!tts.current) return;
              if (!session.current) return;

              audio.src = URL.createObjectURL(response.data);
              audio.load();
              audio.play();
            })
            .catch((error) => {
              console.log(error);
            });

          return;

        default:
          break;
      }

      return;
    }



    let text = message;
    // phone number check
    const phoneRegex = /(\+91)?[6-9][0-9]{9}/g;
    // Email check
    const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$'/gi;
    // const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/gi;
    // regex to check "UPI" word in the text. Match only UPI word in capital
    const upiRegex = /UPI/g;
    // regex to check AM and PM in the text
    const amPmRegex = /AM|PM/g;
    // regex to check numbers in the text
    const digitRegex = /[0-9]+/g;


    let isLink = text.indexOf("[link](");
    let lang = language;

    // check if lang is present in the list details?.current?.languages[0]
    if (
      details?.current?.languages &&
      details.current.languages.length > 0 &&
      !details.current.languages.includes(lang)
    ) {
      lang = details.current.languages[0];
    }

    if (value) lang = value;
    if (lang === "hi" && isLink === -1) {
      isLink = text.indexOf("[लिंक](");
    }
    // let isLinkHindi = text.indexOf('[लिंक](');
    if (isLink === -1) {
      isLink = text.indexOf("[img](");
      if (lang === "hi" && isLink === -1) {
        isLink = text.indexOf("[IMG](");
      }
    }
    if (isLink === -1) {
      isLink = text.indexOf("[video](");
      if (lang === "hi" && isLink === -1) {
        isLink = text.indexOf("[वीडियो](");
      }
    }
    if (isLink === -1) {
      // return text;
    } else {
      const nextIndex = text.indexOf(")", isLink);
      const startText = text.substring(0, isLink);
      const endText = text.substring(nextIndex + 1);
      text = startText + endText;
      if (text.trim().length === 0) {
        const queue = _.uniq(ttsQueue);
        queue.shift();
        setTtsQueue(queue);
        audio.pause();
        // audio.dispatchEvent(new Event('ended', { bubbles: true }));
        return;
      }
    }

    let ssmlText = "";

    // test text with regex and email regex
    const emailRegexTest = emailRegex.test(text);
    const phoneRegexTest = phoneRegex.test(text);
    const upiRegexTest = upiRegex.test(text);
    const amPmRegexTest = amPmRegex.test(text);
    let isNumericTTS = text.indexOf("$[numerictts]");
    // variable to check if the text contains $[numericstt]
    const isNumericSTT = text.indexOf('$[numericstt]');

    const isSSML =
      phoneRegexTest ||
      emailRegexTest ||
      upiRegexTest ||
      amPmRegexTest ||
      isNumericTTS !== -1;

    // check if isNumericSTT is present in the text then remove the $[numericstt] from the text
    if (isNumericSTT !== -1) {
      // remove the $[numericstt] from the text
      const numericttsIndex = text.indexOf("$[numericstt]");
      const startText = text.substring(0, numericttsIndex);
      const endText = text.substring(numericttsIndex + 13);
      text = startText + endText;
    }

    if (isSSML) {
      ssmlText = `<speak >${text.replaceAll(
        phoneRegex,
        (s) => `<s><say-as interpret-as="digits">${s}</say-as></s>`
      )}</speak>`;

      if (isNumericTTS !== -1) {
        // remove the $[numerictts] from the text
        const numericttsIndex = ssmlText.indexOf("$[numerictts]");
        const startText = ssmlText.substring(0, numericttsIndex);
        const endText = ssmlText.substring(numericttsIndex + 13);
        ssmlText = startText + endText;

        // replace only the first number with the ssml tag
        ssmlText = ssmlText.replace(
          digitRegex,
          (s) => `<s><say-as interpret-as="digits">${s}</say-as></s>`
        );
      }

      ssmlText = ssmlText.replaceAll(
        emailRegex,
        (email) =>
          `<break time="200ms" /><voice name="en_female">${email}</voice>`
      );

      ssmlText = ssmlText.replaceAll(
        upiRegex,
        (upiText) =>
          `<s><say-as interpret-as="characters">${upiText}</say-as></s>`
      );

      ssmlText = ssmlText.replaceAll(
        amPmRegex,
        (s) => `<s><say-as interpret-as="characters">${s}</say-as></s>`
      );
    }

    const data = {
      format: "mp3",
      speed: 1.2,
      pitch: 1.0,
      segment: true,
      cache: false,
    };

    if (isSSML) {
      data.ssml = ssmlText;
    } else {
      data.text = text;
    }

    // // replace localisation with proper phonemes
    // text = text.replaceAll(
    //     'Localisation',
    //     '{{L OW0 K AH0 L AH0 IY0 Z EY1 SH AH0 N}}')
    //
    // text = text.replaceAll(
    //     'localisation',
    //     '{{L OW0 K AH0 L AH0 IY0 Z EY1 SH AH0 N}}')

    axios({
      method: "post",
      url: appConfig.ttsUrl,
      headers: {
        ...appConfig.ttsHeaders,
        speaker: getSpeaker(lang),
      },
      data: data,
      responseType: "blob",
    }).then((res) => {
      if (audio && !audio.paused) {
        return;
      }
      if (!tts.current) return;
      if (!session.current) return;


      audio.src = URL.createObjectURL(res.data);
      audio.load();
      audio.play();
    });

    //   set flag for audio playing
    setIsAudioPlaying(true);
  };

  const handleEnd = () => {
    const newQueue = _.uniq(ttsQueue);
    const setQueue = _.uniq(ttsQueue);
    setQueue.shift();
    setTtsQueue(setQueue);
    newQueue.shift();
    if (newQueue.length !== 0) {
      handleTts(newQueue[0]);
    }

    // set the audio playing flag
    setIsAudioPlaying(false);
  };

  useEffect(() => {
    if (audio && tts.current) {
      if (ttsQueue.length !== 0 && audio.paused) {
        handleTts(ttsQueue[0]);
      }
      audio.addEventListener("ended", handleEnd);
    }
    if (!tts?.current) {
      setIsAudioPlaying(false);
    }
    return () => {
      if (audio && tts.current) {
        audio.removeEventListener("ended", handleEnd);
      }
    };
  }, [audio, ttsQueue, tts]);

  const toggleTts = () => {
    if (tts.current && audio && !audio.paused) audio.pause();
    // if(!tts.current && settingNewMessages) initialTts(_.uniq(langSelectMessages));
    // setTts(!tts);
    tts.current = !tts.current;
    setTtsQueue([]);
  };

  const handleSpeech = () => {
    window.toggleListening();
  };

  const handleOpenChange = (value) => {
    setOpen(value);
  };

  const handleListening = (value) => {
    setIsListening(value);
    if (isLoading && value) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.setBotMessage = setMessage;
    window.setBotListening = handleListening;
    window.sendBotMessage = sendMessage;
    return () => {
      window.setBotMessage = undefined;
      window.setBotListening = undefined;
      window.sendBotMessage = undefined;
    };
  }, [setMessage, sendMessage, isListening, isLoading]);

  const closeChatWindow = (expire) => {
    if (open) {
      sendMessage("/quit");
      setMessages([]);
      setMessage("");
      setUid(null);
      setOpen(false);
      if (tts.current && audio && !audio.paused) audio.pause();
      setTtsQueue([]);
      setLangSelected(false);
      session.current = false;
      if (socket) {
        socket.onmessage = null;
        socket = null;
      }
      setLanguage("en");
      window.dictate.setLanguage("en");
      window.dictate.setServer(
        `wss://revapi.reverieinc.com/stream?src_lang=en&apikey=${sttApiKey}&domain=generic&silence=1&appid=${sttAppId}&appname=${sttAppName}&continuous=0`
      );


      // clear the message queue
      setMessageQueue([]);

      // reset expired and expireSession
      expired = false;
      setExpireSession(false);

      setInitiatingSocket(false);
    } else {
      setOpen(true);
      initializeChat();
      session.current = true;

      setInitiatingSocket(false);
    }
  };

  const toggleChatWindow = () => {
    if (open) {
      setOpen(false);

    } else {
      setOpen(true);
      if (!session.current) {
        initializeChat();
      }
    }
  };

  const onHandler = (event, data) => {
    if (event === "results") {
      let updatedText = data;
      // check if the first character is uppercase and the last character is a full stop. If yes, then convert the string to lowercase and remove the full stop
      if (updatedText && updatedText[0] === updatedText[0].toUpperCase() && updatedText[updatedText.length - 1] === '.') {
        updatedText = updatedText.toLowerCase().slice(0, -1);
      }
      setMessage(data);
    } else if (event === "started") {
      setIsListening(true);
    } else if (event === "stopped") {
      setIsListening(false);
      // sendMessage();
      setShouldSend(true);
    }
  };

  const toggleMic = () => {
    // if (!isListening) {
    //     setIsLoading(true);
    // }
    // get the last message where type is bot
    const lastBotMessage = messages.filter(m => m.type === 'bot')[messages.filter(m => m.type === 'bot').length - 1];
    // get the last message from messages
    const lastMessage = messages[messages.length - 1];
    // check if last message contains "pan" text. Make it case insensitive
    const PAN_UTTERANCES = [
      "pan",
      "पैन",
      "প্যান",
      "পেন",
      "ಪ್ಯಾನ್",
      "പാൻ",
      "ପ୍ୟାନ୍",
      "पॅन",
      "పాన్",
    ];

    // check if lastMessage?.text?.toLowerCase() includes any of the LANGUAGE_UTTERANCES
    const LANGUAGE_UTTERANCES = ["please choose your preferred language"];
    const isLanguage = LANGUAGE_UTTERANCES.some((utterance) =>
      lastBotMessage?.text?.toLowerCase().includes(utterance)
    );

    // check if lastMessage?.text?.toLowerCase() includes any of the PAN_UTTERANCES
    const isPan = PAN_UTTERANCES.some((utterance) =>
      lastMessage?.text?.toLowerCase().includes(utterance)
    );

    // check if last lastMessage contains $[numericstt] text in it or not
    const isNumericSTT = lastMessage?.text?.indexOf('$[numericstt]');

    console.log({ isNumericSTT });
    let sttUrl;
    if (isNumericSTT && isNumericSTT !== -1) {
      sttUrl = `wss://revapi.reverieinc.com/stream?src_lang=${language}&apikey=${sttApiKey}&domain=alphanumeric&silence=1&appid=${sttAppId}&appname=${sttAppName}&continuous=0`;
      window.dictate.setServer(sttUrl);
    } else if (isLanguage) {
      sttUrl = `wss://revapi.reverieinc.com/stream?src_lang=${language}&apikey=${sttApiKey}&domain=language&silence=3&appid=${sttAppId}&appname=${sttAppName}&continuous=0`;
      window.dictate.setServer(sttUrl);
    } else if (isPan) {
      sttUrl = `wss://revapi.reverieinc.com/stream?src_lang=${language}&apikey=${sttApiKey}&domain=alphanumeric&silence=3&appid=${sttAppId}&appname=${sttAppName}&continuous=0`;
      window.dictate.setServer(sttUrl);
    } 
     //checking if the last message has any variable keyname associated with it(if there is no variable_keyname in the message that means that the variable is not an STT variable)
     else if(lastMessage?.variable_keyname && lastMessage.variable_keyname!='')
     {
       const domain= window.sansadhaksttVariablesInfo.filter((v)=>{ return v.name===lastMessage.variable_keyname})[0].sttConfig.domain;
       sttUrl=`wss://revapi.reverieinc.com/stream?src_lang=${language}&apikey=${sttApiKey}&domain=${domain}&silence=3&appid=${sttAppId}&appname=${sttAppName}&continuous=0`;
     }
    else {
      sttUrl = `wss://revapi.reverieinc.com/stream?src_lang=${language}&apikey=${sttApiKey}&domain=generic&silence=1&appid=${sttAppId}&appname=${sttAppName}&continuous=0`;
      // window.dictate.setServer(sttUrl);
    }
    // window.toggleListening();

    
   
   
   

    if (mozillaSTT) {
      speechHandler.setConfig({
        speechEngine: "mozilla",
        language,
        on: onHandler,
      });
      setMozillaSTT(false);
    } else {
      speechHandler.setConfig({
        speechEngine: "reverie",
        server: sttUrl,
        on: onHandler,
      });
    }

    speechHandler.startListening();
  };


  useEffect(() => {
    if (shouldSend) {
      sendMessage();
      setShouldSend(false);
    }
  }, [shouldSend]);

  // Swalekh functions
  const initSwalekh = (value) => {
    const id = "textarea";
    const keyboard = true;
    const keyboardMode = "phonetic";
    // const language = language;
    const languageMap = appConfig.languageMap;
    let lang;
    Object.keys(languageMap).map((l) => {
      if (languageMap[l] === language) {
        lang = l;
      }
    });
    if (value) {
      lang = value;
    }
    let mode = keyboardMode;
    if (!lang || lang === "en") {
      return;
    }
    if (!keyboard) {
      return;
    }
    const $ = window.$;
    if (
      $(`#${id}`).attr("data-indic-input-mode") &&
      $(`#${id}`).attr("data-indic-input-mode") !== keyboardMode
    ) {
      return;
    }

    // Sansadhak config
    $(`#${id}`).indicInput({
      apikey: "afee449fdccfa8d5890d5076eb456a79",
      appid: "com.prabandhak",
      orgName: "Prabandhak",
      numSuggestions: 7,
      mode,
      domain: 1,
      theme: "light",
    });
    $(`#${id}`).trigger("change_lang", lang);
  };

  const deactivateSwalekh = () => {
    const $ = window.$;
    const id = "textarea";
    if ($(`#${id}`).data("mode")) {
      if ($(`#${id}`).getkeyboard()) {
        $(`#${id}`).removeClass("ui-keyboard-autoaccepted");
        $(`#${id}`).removeAttr("data-indic-input-mode");
        $(`#${id}`).getkeyboard().destroy();
      } else {
        $(`#${id}`).removeAttr("data-indic-input-mode");
        setTimeout(() => {
          $(`#${id}`).textcomplete("destroy");
        }, 100);
      }
    }
  };

  const handleSwalekhLangChange = (value) => {
    // handleLangChange(value);
    const languageMap = appConfig.languageMap;
    let currLang;
    Object.keys(languageMap).map((l) => {
      if (languageMap[l] === value) {
        currLang = l;
      }
    });
    const id = "textarea";
    const $ = window.$;
    if (currLang === "en") {
      deactivateSwalekh();
    } else {
      if (
        !$(`#${id}`).attr("data-indic-input-mode") &&
        !$(`#${id}`).attr("data-indic-input-mode") !== "phonetic"
      ) {
        // return;

        initSwalekh(value);
      } else {
        $(`#textarea`).trigger("change_lang", value);
      }
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSwalekhClick = (e) => {
    setMessage(e.target.value);
    setTimeout(() => {
      setTest((prev) => !prev);
    }, 10);
  };

  function handleClickOutside(event) {
    if (
      ref.current &&
      !ref.current.contains(event.target) && // THIS IS IMPORTANT TO CHECK
      document.activeElement === ref.current
    ) {
      const curr = document.getElementById("textarea");
      curr.dispatchEvent(new Event("change"));
      // setTest(true)
      // const $ = window.$;
      // const val = $('#textarea').val();
      //   setHtml(val);
      // $('#textarea').val(val);
      // setTest(prev => !prev);
    }
  }

  const $textarea = document.getElementById("textarea");
  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);
    if (ref.current) {
      //   '$textarea height before',
      //   $textarea.style.lineHeight,
      //   $textarea.offsetHeight
      // );
      // $textarea.style.lineHeight = `${$textarea.offsetHeight}px`;
      ref.current?.addEventListener("change", handleSwalekhClick);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      if (ref.current) {
        ref.current?.removeEventListener("change", handleSwalekhClick);
      }
    };
  }, [open]);

  // End Swalekh functions

  const handleLangChange = async (value) => {
    window.dictate.setLanguage(value);
    window.dictate.setServer(
      `wss://revapi.reverieinc.com/stream?src_lang=${value}&apikey=${sttApiKey}&domain=generic&silence=1&appid=${sttAppId}&appname=${sttAppName}&continuous=0`
    );
    handleSwalekhLangChange(appConfig.languageMap[value]);
    // initSwalekh(appConfig.languageMap[value]);
    initializeBot(value);

    setLanguage(value);
    setLangSelected(true);
    // setAskingNumber(true);
  };

  function showLangSelectBotMessage() {
    let newMessages = langSelectMessages.map((m) => {
      if (m.type === "bot") {
        m.timestamp = moment(Date.now()).format("hh:mm A");
      }
      return m;
    });

    setMessages((prev) => [
      ...prev,
      ..._.uniq(newMessages),
    ]);

    // setMessages(_.uniq(newMessages));
    setTtsQueue([langSelectMessages[0].text]);

    // scroll to bottom
    scrollToEnd();
  }

  const initializeChat = () => {
    const $ = window.$;
    const id = "textarea";
    // chatClosed = false;
    setTimeout(() => {
      if (language === "en") {
        deactivateSwalekh();
      } else {
        if (
          !$(`#${id}`).attr("data-indic-input-mode") &&
          !$(`#${id}`).attr("data-indic-input-mode") !== "phonetic"
        ) {
          initSwalekh(appConfig.languageMap[language]);
        } else {
          $(`#textarea`).trigger(
            "change_lang",
            appConfig.languageMap[language]
          );
        }
      }
    }, 100);
    setTimeout(() => {
      // if number of languages is more than 1 then show language selection modal else directly initialize bot
      if (details?.current?.languages?.length > 1) {
        showLangSelectBotMessage();
      } else {
        handleLangChange(details?.current?.languages[0]);
      }
    }, 500);

    setUid(undefined);
    session.current = true;
    // expired = false;

    //   set selected option
    setSelectedOptions([]);
  };

  //  console.log(navigator?.brave===undefined)
  // New Content
  const content = (
    <div
      style={{
        backgroundColor: "#FCFCFC",
        boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.12)",
        height: isMobile == true ? (isIOS ? (isChrome?'99vh':'90vh') : '93vh'):'',
        width: isMobile == true ? "99vw" : "",
        overflow: "hidden",
        wordBreak: "break-all",
        position: "relative",
        // backgroundImage: 'url("/chat-bg.svg")',
        backgroundImage: isMobileLayout
          ? ""
          : `url("https://sansadhak-dev.reverieinc.com/chat-bg.svg")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
      className={`overlay-container ${isMobileLayout ? "mobile" : ""}`}
    >
      <ChatWindowHeader
        closeChatWindow={closeChatWindow}
        toggleTts={toggleTts}
        tts={tts.current}
        botName={botStyle?.style?.botName}
        botStatus={botStyle?.style?.botStatus}
        newIconUrl={botStyle?.style?.newIconUrl}
        colors={botStyle?.style?.colors}
        botVoice={botStyle?.style?.botVoice}
        lang={language}
        isMobileLayout={isMobileLayout}
      />

      <div
        id="chat-container"
        className="content-content"
        style={{
          ...chatContainerStyle,
          height: `calc(100% - 92px - ${textareaHeight}px - 1em)`,
          padding: "1em",
          position: "relative",
          zIndex: "10",
          overflow: "auto",
        }}
      >
        <div
          className="content"
          style={{
            display: "grid",
            gap: "1em .5em",
            zIndex: "2",
            height: "auto",
            position: "relative",
          }}
        >
          {messages.map((message, index) => {
            if (message.type === "user" || message.type === "bot") {
              return (
                <Chat
                  key={index}
                  message={message}
                  botStyle={botStyle}
                  isMobileLayout={isMobileLayout}
                />
              );
            } else if (message.type === "loading") {
              return (
                <Typing
                  key={index}
                  newIconUrl={botStyle?.style?.newIconUrl}
                  botStyle={botStyle}
                />
              );
            } else if (message.type === "select") {
              return (
                <SelectLang
                  key={index}
                  setLanguage={handleLangChange}
                  langSelected={langSelected}
                  languages={details?.current?.languages}
                  newIconUrl={botStyle?.style?.newIconUrl}
                />
              );
            } else if (message.type === "multiple") {
              return (
                <MultipleSelectMessage
                  key={index}
                  options={message.options}
                  handleMultipleSelect={handleMultipleSelect}
                  newIconUrl={botStyle?.style?.newIconUrl}
                />
              );
            } else {
              return (
                <ButtonsMessage
                  key={index}
                  buttons={message.buttons}
                  handleButtonSelect={handleButtonSelect}
                  index={index}
                  selectedOptions={selectedOptions}
                  newIconUrl={botStyle?.style?.newIconUrl}
                  expired={expired}
                />
              );
            }
          })}
          {/*show a message that connecting with english or hindi bot based on initiatingSocket variable */}
          {initiatingSocket && (
            <div
              style={{
                bottom: "0",
                left: "0",
                right: "0",
                height: "3em",
                backgroundColor:
                  botStyle?.style?.colors?.botMessage || "#426AFB",
                display: "grid",
                placeItems: "center",
                color: botStyle?.style?.colors?.botText || "#fff",
                zIndex: "10",
              }}
            >
              Connecting with {LANGUAGES[language]} bot...
            </div>
          )}

          {/*show a message that session expired based on expireSession variable */}
          {/* {expired && (
            <div
              style={{
                bottom: "0",
                left: "0",
                right: "0",
                height: "4em",
                paddingBottom: "4px",
                backgroundColor:
                  botStyle?.style?.colors?.botMessage || "#426AFB",
                display: "grid",
                placeItems: "center",
                color: botStyle?.style?.colors?.botText || "#fff",
                zIndex: "10",
                opacity: "1",
              }}
            >
              {getSessionTimeoutMessage(language)}
              <button
                onClick={handleRefresh}
                style={{
                  marginLeft: "10px",
                  marginTop: "2px",
                  paddingBottom: "2px",
                  backgroundColor:
                    botStyle?.style?.colors?.botMessage || "#426AFB",
                  color: botStyle?.style?.colors?.botText || "#000000",
                  opacity: 1,
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                Click Here to start again
              </button>
            </div>
          )} */}
          {expired && (
            <div
              style={{
                position: "absolute", // or 'fixed' depending on your layout needs
                bottom: "0",
                left: "0",
                right: "0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // padding: "1em",
                // backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
                zIndex: "1000", // Ensure it's above everything else
              }}
            >
              <button
                onClick={handleRefresh}
                style={{
                  fontSize: "1em",
                  fontWeight: "bold",
                  color: botStyle?.style?.colors?.botText || "#fff",
                  backgroundColor:
                    botStyle?.style?.colors?.botMessage || "#426AFB",
                  border: "none",
                  borderRadius: "20px",
                  padding: "10px 20px",
                  cursor: "pointer",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  outline: "none",
                  transition: "background-color 0.2s, transform 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#365899")
                }
                onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor =
                  botStyle?.style?.colors?.botMessage || "#426AFB")
                }
              >
                Click Here to start again
              </button>
            </div>
          )}
        </div>
      </div>

      <ChatWindowFooter
        message={message}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        handleSendMessage={handleSendMessage}
        toggleMic={toggleMic}
        isListening={isListening}
        isLoading={isLoading}
        colors={botStyle?.style?.colors}
        ref={ref}
        expired={expired}
        textareaHeight={textareaHeight}
        botVoice={botStyle?.style?.botVoice}
        lang={language}
        isMobileLayout={isMobileLayout}
      />
      {isMobileLayout ? <div /> : <PoweredByComponent />}
    </div>
  );

  return (
    <div className={``}>
      <Popover
        open={open}
        // onOpenChange={handleOpenChange}
        // trigger="click"
        content={content}
        placement={getPopoverPlacement()}
        overlayClassName="chat-ui-overlay"
      >
        <ChatBotIcon
          botPosition={botStyle?.style?.botPosition}
          chatIcon={botStyle?.style?.chatIcon}
          botIconType={botStyle?.style?.botIconType}
          colors={botStyle?.style?.colors}
          botIconUrl={botStyle?.style?.botIconUrl}
          styleProps={{ height: "3em", width: "3em", cursor: "pointer" }}
          toggleChatWindow={toggleChatWindow}
          botIconText={botStyle?.style?.botIconText}
        />
      </Popover>
      <div
        className={`black-overlay ${open ? "active" : ""}`}
        onClick={toggleChatWindow}
      ></div>
    </div>
  );

  function handleSendMessage() {
    sendMessage();
  }

  function handleKeyDown(event) {
    const value = event.target.value;
    if (isEmpty(trim(value))) {
      return;
    }
    setMessage(event.target.value);
    if (event?.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      sendMessage(event.target.value);
    }
  }

  function handleInputChange(event) {
    setMessage(event.target.value);

    const $textarea = event.target;
    $textarea.style.height = "0px";
    if ($textarea.scrollHeight > 100) {
      $textarea.style.height = "100px";
      setTextareaHeight(100);
    } else {
      $textarea.style.height = `${$textarea.scrollHeight}px`;
      setTextareaHeight($textarea.scrollHeight);
    }
    scrollToEnd();
  }
};

export default App;
