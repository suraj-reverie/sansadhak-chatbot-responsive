import React from "react";
import { Avatar } from "antd";
import moment from "moment";
import upperCase from "lodash/upperCase";
import userImage from "../assets/general/user.png";
import userIconImage from "../assets/general/user-icon.svg";
import BotAvatarComponent from "./BotAvatar";
import * as PropTypes from "prop-types";

function MessageComponent(props) {
  return ( 
    <div
      style={{
        padding: "1em 1em 0.25em 1em",
        borderRadius: props.isMobileLayout ?"8px":props.type === "user" ? "20px 5px 20px 20px" : "5px 20px 20px 20px",
        backgroundColor:props.isMobileLayout? "#F0EFF4": props.type === "user"? props.style?.colors?.customerMessage: props.style?.colors?.botMessage,
        color: props.isMobileLayout?"#4F4F50": props.type === "user"? props.style?.colors?.customerText: props.style?.colors?.botText,
        justifySelf: props.type === "user" ? "end" : "start",
        maxWidth: "80%",
        width: "fit-content",
        marginTop: props.type === "user" ? "35px" : "35px", // 35px is the height of the bot avatar
        marginLeft: props.type === "user" ? "0" : "-41px", // - (35px + 6px) = -41px is the width of the bot avatar + padding
        marginRight: props.type === "user" ? "-41px" : "0", // - (35px + 6px) = -41px is the width of the bot avatar + padding
        boxShadow: "0px 2px 4px 0px #00000033",
        border:props.isMobileLayout?"#FCFCFC":
          props.type === "user" ? "1px solid #FCFCFC" : "1px solid #426AFB",
      }}
    >
      <span
        style={{
          fontSize: props.style?.textConfig?.message?.fontSize,
          color:props.isMobileLayout?"#4F4F50":
            props.type === "user"
              ? props.style?.colors?.customerText
              : props.style?.colors?.botText,
          display: "inline-block",
          width: "100%",
          wordBreak: "break-word",
          fontWeight: props.style?.textConfig?.message?.bold
            ? "bold"
            : "normal",
          fontStyle: props.style?.textConfig?.message?.italic
            ? "italic"
            : "normal",
          textDecoration: props.style?.textConfig?.message?.underline
            ? "underline"
            : "normal",
        }}
      >
        {props.showMessage}
      </span>
      <span
        style={{
          float: "right",
          fontSize: "9px",
          fontStyle: "italic",
          display: "inline-block",
        }}
      >
        {props.chatTimeStamp}
      </span>
    </div>
  );
}

MessageComponent.propTypes = {
  type: PropTypes.any,
  style: PropTypes.any,
  showMessage: PropTypes.func,
  chatTimeStamp: PropTypes.any,
  isMobileLayout:PropTypes.any
};

const Chat = ({ message, botStyle ,isMobileLayout }) => {
  // const date = new Date();
  const messageTimestamp = message.timestamp;

  function getLinkMessage(text, isLink) {
    const nextIndex = text.indexOf(")", isLink);
    let link = text.substring(isLink + 7, nextIndex);
    const startText = text.substring(0, isLink);
    const endText = text.substring(nextIndex + 1);
    return (
      <div>
        <p
          style={{
            // fontSize: '12px',
            // color: message.type === 'user' ? '#fff' : '#4F4F50',
            display: "inline-block",
            width: "100%",
          }}
        >
          <NewlineText text={startText} />
        </p>
        <a style={{ color: "rgb(66, 106, 251)" }} target="_blank" href={link}>
          Link
        </a>
        <p
          style={{
            // fontSize: '12px',
            // color: message.type === 'user' ? '#fff' : '#4F4F50',
            display: "inline-block",
            width: "100%",
          }}
        >
          <NewlineText text={endText} />
        </p>
      </div>
    );
  }

  function getImageMessage(text, isImage) {
    const nextIndex = text.indexOf(")", isImage);
    let link = text.substring(isImage + 6, nextIndex);
    const startText = text.substring(0, isImage);
    return (
      <div>
        <p
          style={{
            // fontSize: '12px',
            // color: message.type === 'user' ? '#fff' : '#4F4F50',
            display: "inline-block",
            width: "100%",
            margin: "0",
          }}
        >
          {startText}
        </p>
        <div
          style={{
            padding: "1em",
          }}
        >
          <img src={link} alt="image" width={"100%"} height={"100%"} />
        </div>
      </div>
    );
  }

  function getVideoMessage(text, isImage) {
    const nextIndex = text.indexOf(")", isImage);
    let link = text.substring(isImage + 8, nextIndex);
    if (link[0] === "(") {
      link = text.substring(isImage + 9, nextIndex);
    }
    const startText = text.substring(0, isImage);
    return (
      <div>
        <p
          style={{
            fontSize: "12px",
            color: "#4F4F50",
            display: "inline-block",
            width: "100%",
            margin: "0",
          }}
        >
          {startText}
        </p>
        <div style={{ padding: "1em" }}>
          <video width="100%" height={"100%"} controls>
            <source src={link} />
          </video>
        </div>
      </div>
    );
  }

  const showMessage = (text) => {
    // remove $[numerictts] from text
    let isTTS = text.indexOf("$[");
    if (isTTS !== -1) {
      const nextIndex = text.indexOf("]", isTTS);
      const startText = text.substring(0, isTTS);
      const endText = text.substring(nextIndex + 1);
      text = startText + endText;
    }
    if (text.includes("$[numerictts]")) {
      text = text.replace(/\$\[numerictts\]/g, "");
    }

    let isLink = text.indexOf("[link](");
    if (isLink === -1) {
      isLink = text.indexOf("[लिंक](");
    }
    let isImage = text.indexOf("[img](");
    if (isImage === -1) {
      isImage = text.indexOf("[IMG](");
    }
    let isVideo = text.indexOf("[video](");
    if (isVideo === -1) {
      isVideo = text.indexOf("[वीडियो](");
    }
    if (isLink !== -1) {
      return getLinkMessage(text, isLink);
    }
    if (isImage !== -1) {
      return getImageMessage(text, isImage);
    }
    if (isVideo !== -1) {
      return getVideoMessage(text, isVideo);
    }
    return <NewlineText text={text} />;
  };

  function NewlineText(props) {
    const text = props.text;
    return text.split("\n").map((str) => <p style={{ margin: 0 }}>{str}</p>);
  }

  // const chatTimeStamp = (
  //   <span
  //     style={{
  //       float: "right",
  //       fontSize: "9px",
  //       fontStyle: "italic",
  //       display: "inline-block",
  //     }}
  //   >
  //     {moment(message.timestamp).format("hh:mm A")}
  //   </span>
  // );

  const userAvatar = (
    <div
      style={{
        padding: "6px",
        borderRadius: "50%",
        background: "white",
        zIndex: "999",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "fit-content",
        height: "fit-content",
      }}
    >
      <Avatar
        style={{
          fontSize: "16px",
          width: isMobileLayout?"24px":"35px",
          height: isMobileLayout?"24px":"35px",
          color: "#fff",
        }}
        src={userIconImage}
      />
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        justifySelf: message.type === "user" ? "end" : "start",
        flexDirection: "row",
        width: "100%",
        justifyContent: message.type === "user" ? "flex-end" : "flex-start",
      }}
    >
      {message.type === "bot" && (
        <BotAvatarComponent newIconUrl={botStyle?.style?.newIconUrl} isMobileLayout={isMobileLayout} />
      )}
      <MessageComponent
        type={message.type}
        style={botStyle?.style}
        showMessage={showMessage(message.text)}
        // chatTimeStamp={chatTimeStamp}
        isMobileLayout={isMobileLayout}
        chatTimeStamp={messageTimestamp}
      />
      {message.type === "user" && userAvatar}
    </div>
  );
};

export default Chat;
