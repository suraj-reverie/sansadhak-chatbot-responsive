import React from 'react';
import { Popconfirm } from 'antd';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { ReactComponent as IndianWomanIcon } from '../assets/botStyle/indian-woman.svg';
import { ReactComponent as ChatIconMale } from '../assets/botStyle/chat-icon-male.svg';
import { ReactComponent as CrossIcon } from '../assets/botStyle/cross.svg';

export function ChatWindowHeader({
  closeChatWindow,
  toggleTts,
  tts,
  botName,
  botStatus,
  newIconUrl,
  colors,
  botVoice = true,
  isMobileLayout
}) {
  return (
    <div
      className={`content-title ${isMobileLayout ? 'mobile-title' : ''}`}
      style={{
        backgroundColor: colors?.header || '#426AFB',
        boxShadow: '0px 0px 8.83271px rgba(0, 0, 0, 0.12)',
        color: '#fff',
        margin: 'auto',
        position: 'relative',
        zIndex: '10',
        padding: '0.5em 0.25em',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.5em 1em',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {newIconUrl && newIconUrl !== 'default' ? (
              <img
                src={newIconUrl}
                alt="icon"
                style={{
                  height: '2.5em',
                  width: '2.5em',
                  marginRight: '0.5em',
                }}
              />
            ) : (
              <ChatIconMale
                style={{
                  fill: '#FFF',
                  height: '2.5em',
                  width: '2.5em',
                  background: 'white',
                  borderRadius: '50%',
                  padding: '0.0125em',
                  marginRight: '0.5em',
                }}
              />
            )}
          </div>

          <div>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 400,
                color: colors?.headerText || '#FCFCFC',
                lineHeight: '1.25em',
                marginBottom: '0.25em',
              }}
            >
              {botName}
            </p>
            <p
              style={{
                fontSize: '12px',
                fontWeight: 400,
                color: colors?.headerText || '#FCFCFC',
                lineHeight: '1em',
                margin: 0,
              }}
            >
              {botStatus}
            </p>
          </div>
        </div>
        <div
          style={{
            padding: '0 1em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {botVoice && (
            <>
              {tts && (
                <VolumeUpIcon
                  onClick={toggleTts}
                  style={{
                    fill: '#FFF',
                    height: '28px',
                    width: '28px',
                    marginRight: '.5em',
                    cursor: 'pointer',
                  }}
                />
              )}
              {!tts && (
                <VolumeOffIcon
                  onClick={toggleTts}
                  style={{
                    fill: '#FFF',
                    height: '28px',
                    width: '28px',
                    marginRight: '.5em',
                    cursor: 'pointer',
                  }}
                />
              )}
            </>
          )}
          <Popconfirm
            title="Do you want to close the session?"
            onConfirm={closeChatWindow}
            okText="Yes"
            cancelText="No"
            placement="topRight"
            overlayInnerStyle={{position:'relative', top:'5vh'}}
          >
            <div style={{ display: 'flex', cursor: 'pointer' }}>
              <CrossIcon
                style={{
                  fill: '#FFF',
                  cursor: 'pointer',
                  width: '20px',
                  height: '20px',
                }}
              />
            </div>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
}
