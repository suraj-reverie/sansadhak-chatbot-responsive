import React from 'react';
import { Button } from 'antd';

export function OnlineBotIcon({ toggleChatWindow, style }) {
  return (
    <Button
      type="primary"
      style={{
        backgroundColor: '#426AFB',
        paddingLeft: '4em',
        paddingRight: '4em',
        height: '3em',
        width: 'unset',
        borderRadius: '5px',
        cursor: style?.cursor ? style.cursor : 'not-allowed',
      }}
      onClick={toggleChatWindow}
    >
      Online
    </Button>
  );
}
