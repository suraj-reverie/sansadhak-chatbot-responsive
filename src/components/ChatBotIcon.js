import React from 'react';
import { getBotIcon } from '../utils/utilFunctions';
import { OnlineBotIcon } from './OnlineBotIcon';

export function ChatBotIcon({
  botPosition,
  chatIcon,
  botIconType,
  colors,
  botIconUrl,
  styleProps,
  toggleChatWindow,
  botIconText
}) {
  const botIcon = getBotIcon({
    botIconType: botIconType,
    styleProps: {
      height: '3em',
      width: '3em',
      fill: colors?.icon,
      ...styleProps,
    },
    botIconUrl: botIconUrl,
  });

  return (
    <div
      style={{ position: 'fixed', cursor: 'pointer', zIndex: '999', pointerEvents: 'all' }}
      className={`chat-icon-style ${botPosition}`}
    >
      {chatIcon === 0 ? (
        <div
          onClick={toggleChatWindow}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {botIcon}
        </div>
      ) : (
        <OnlineBotIcon style={styleProps} toggleChatWindow={toggleChatWindow} />
      )}
      <div
        style={{
          fontSize: '.9em',
          padding: '.5em',
          backgroundColor: colors?.helperText || '#0c85ba',
          borderRadius: '4px',
          color: '#fff',
          margin: '.5em',
        }}
      >
        {botIconText || "Hi! I'm your Virtual Assistant"}
      </div>
    </div>
  );
}
