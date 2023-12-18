import { Avatar } from 'antd';
import React from 'react';
// import { ReactComponent as IndianWomanIcon } from '../assets/botStyle/indian-woman.svg';
import { ReactComponent as ChatIconMale } from '../assets/botStyle/chat-icon-male.svg';
import { ReactComponent as BotFemaleIcon } from '../assets/botStyle/bot_icon_female.svg';
import { ReactComponent as MoolCircleIcon } from '../assets/botStyle/mool-circle.svg';

function BotAvatarComponent({ newIconUrl, isHistory, isMobileLayout }) {
    const projectId = window.sansadhakProjectId;
    const botGender = window.sansadhakStyles?.style?.botGender;

    // show bot icon for reverie bot
    if (projectId === '00d0b826-331f-4ae3-9d66-2768615ece41') {
        return (
            <div
                style={{
                    display: 'flex',
                    width: 'fit-content',
                    height: 'fit-content',
                    padding: '6px',
                    borderRadius: '50%',
                    background: 'white',
                    zIndex: '999',
                }}
            >
                {newIconUrl && newIconUrl !== 'default' ? (
                    <img
                        src={newIconUrl}
                        alt="icon"
                        style={{
                            height: isHistory ? '50px' : '35px',
                            width: isHistory ? '50px' : '35px',
                            marginRight: '0',
                            marginLeft: '0',
                            padding: '2px',
                        }}
                    />
                ) : (
                    <BotFemaleIcon
                        style={{
                            height: '35px',
                            width: '35px',
                            marginRight: '0',
                            marginLeft: '0',
                        }}
                    />
                )}
            </div>
        );
    }

    // for mool finance bot show custom image
    else if (projectId === '00649082-31e9-4201-a74f-ab6c098fe6cf') {
        return (
            <div
                style={{
                    display: 'flex',
                    width: 'fit-content',
                    height: 'fit-content',
                    padding: '6px',
                    borderRadius: '50%',
                    background: 'white',
                    zIndex: '999',
                }}
            >
                <MoolCircleIcon
                    style={{
                        height: '35px',
                        width: '35px',
                        marginRight: '0',
                        marginLeft: '0',
                    }}
                />
            </div>
        );
    }

    else {
        return (
            <div
                style={{
                    display: 'flex',
                    width: 'fit-content',
                    height: 'fit-content',
                    padding: '6px',
                    borderRadius: '50%',
                    background: 'white',
                    zIndex: '999',
                }}
            >
                {(botGender === 'male') ? (
                    <ChatIconMale
                        style={{
                            height: isMobileLayout ? '24px' : '35px',
                            width: isMobileLayout ? '24px' : '35px',
                            marginRight: '0',
                            marginLeft: '0',
                        }}
                    />
                ) : (
                    <BotFemaleIcon
                        style={{
                            height: isMobileLayout ? '24px' : '35px',
                            width: isMobileLayout ? '24px' : '35px',
                            marginRight: '0',
                            marginLeft: '0',
                        }}
                    />
                )}
            </div>
        );
    }
}

export default BotAvatarComponent;
