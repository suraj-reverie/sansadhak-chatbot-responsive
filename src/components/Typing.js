import React from 'react';
import BotAvatarComponent from './BotAvatar';



const Typing = ({ newIconUrl }) => {


    return (
        <div style={{ display: 'flex' }}>
            <BotAvatarComponent newIconUrl={newIconUrl} />
            <div className="typing">
                <div className="typing__dot"></div>
                <div className="typing__dot"></div>
                <div className="typing__dot"></div>
            </div>
        </div>
    )
}

export default Typing;