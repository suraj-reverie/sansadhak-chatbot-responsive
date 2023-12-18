import React from 'react';
// import { ReactComponent as AttachIcon } from '../assets/botStyle/attach.svg';
// import { ReactComponent as EmojiIcon } from '../assets/botStyle/emoji.svg';
import { ReactComponent as SendNewIcon } from '../assets/botStyle/sendIconNew.svg';
import { ReactComponent as VoiceIcon } from '../assets/botTest/voice-icon.svg';
import { ReactComponent as MobileVoiceIcon } from '../assets/botTest/mobile-mic.svg';

export const ChatWindowFooter = React.forwardRef(
  (
    {
      message,
      handleInputChange = () => { },
      handleKeyDown = () => { },
      handleSendMessage = () => { },
      toggleMic = () => { },
      isListening = false,
      isLoading = false,
      botStyle = {},
      expired = false,
      colors,
      textareaHeight = 35,
      botVoice = true,
      lang,
      isMobileLayout
    },
    ref
  ) => {

    let placeholderText = "Type / Chat here"; // Default placeholder text

    if (lang === "en") {
      placeholderText = "Type / Chat here";
    } else if (lang === "hi") {
      placeholderText = "यहां टाइप / चैट करें";
    } else if (lang === "bn") {
      placeholderText = "এখানে টাইপ / চ্যাট করুন";
    }

    return (
      <div
        className="content-footer"
        style={{
          display: "flex",
          paddingLeft: "0.85em",
          paddingRight: "0.85em",
          // position: 'absolute',
          bottom: "2em",
          width: "100%",
        }}
      >
        <div
          className="input-container"
          style={{
            border: "1px solid #426AFB",
            display: "grid",
            gridTemplateColumns: botVoice ? "8fr 1fr 1fr" : "9fr 1fr",
            borderRadius: "5px",
            width: "100%",
            position: "relative",
            zIndex: "10",
            backgroundColor: "#FCFCFC",
            boxShadow: "0px 0px 9.16658px rgba(0, 0, 0, 0.15)",
            padding: "0.5em",
          }}
        >
          <textarea
            id="textarea"
            ref={ref}
            className="textarea"
            placeholder={placeholderText}
            style={{
              borderRadius: "0",
              width: "100%",
              padding: "5px",
              resize: "none",
              height: `${textareaHeight}px`,
              minHeight: "35px",
              maxHeight: "100px",
              overflowY: isMobileLayout?"":"scroll",
            }}
            // rows={1}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={expired}
          />
          {botVoice && (
            <div
              onClick={!expired && toggleMic}
              style={{ display: "grid", placeItems: "center" }}
            >
              <div
                className={`voice-container ${isListening ? "active" : ""} ${isLoading ? "loading" : ""
                  }`}
              >
              {
                
                <div
                  className="voice-icon active"
                  style={{ backgroundColor:isMobileLayout?"#FCFCFC":isListening?colors?.voiceButtonActive:colors?.buttons, }}
                >

                {  isMobileLayout? <MobileVoiceIcon style={{height:"2em", width:"2em"}}> </MobileVoiceIcon>: <VoiceIcon style={{height:"2em", width:"2em"}} ></VoiceIcon> }
                </div>


                }
                <div
                  className="pulse-div"
                  style={
                    isListening
                      ? { backgroundColor: colors?.voiceButtonActive }
                      : {}
                  }
                ></div>
              </div>
            </div>
          )}

          <div style={{ display: "grid", placeItems: "center" }}>
            <div
              style={{
                cursor: "pointer",
                // backgroundColor: '#F55D55', "#9c195a"
                // backgroundColor: colors?.buttons,
                backgroundColor: isMobileLayout?"#F55D55": message.trim() === "" ? colors?.buttons : colors?.buttons,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.3125em",
                padding: "0.5em",
                marginLeft: "0.625em",
                // width: '10%',
              }}
              // onClick={(e) => !expired && handleSendMessage()}
              onClick={(e) =>
                !expired && message.trim() !== "" && handleSendMessage()
              }
            >
              <SendNewIcon style={{ height: "1.5em", width: "1.5em" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
