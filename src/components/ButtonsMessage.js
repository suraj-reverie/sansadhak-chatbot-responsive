import React from 'react';
import find from 'lodash/find';
import BotAvatarComponent from './BotAvatar';

const ButtonsMessage = ({
    buttons,
    handleButtonSelect,
    newIconUrl,
    expired,
    ...otherProps
}) => {
    const { selectedOptions, index } = otherProps;

    const isButtonSelected = (button) => {
        const selectedOption = find(selectedOptions, { index, button, buttons });
        return !!selectedOption;
    };
    const filteredButtons = buttons
        .map((button) => {
            const option = button?.option;
            // remove the $[numerictts] from the text
            let isNumericTTS = option.indexOf("$[numerictts]");
            if (isNumericTTS !== -1) {
                const numericttsIndex = option.indexOf("$[numerictts]");
                const startText = option.substring(0, numericttsIndex);
                const endText = option.substring(numericttsIndex + 13);
                const updatedOption = startText + endText;
                return {
                    ...button,
                    option: updatedOption,
                }
            } else {
                return button
            }
        })
        .map((button) => ({
            ...button,
            selected: isButtonSelected(button),
        }));
    const isAnyButtonSelected = filteredButtons.some((button) => button.selected);

    return (
        <div style={{ display: 'flex' }}>
            <div className="lang-select-container">
                {filteredButtons.map((button) => {
                    let optionText = button.option;

                    // Check if the string contains "$[numerictts]" and remove it
                    if (optionText.includes("$[numerictts]")) {
                        optionText = optionText.replace(/\$\[numerictts\]/g, "");
                    }
                    return (

                        <div
                            key={button.id}
                            onClick={(e) =>
                                handleButtonSelect({ button, buttons, ...otherProps })
                            }
                            className="lang-item"
                            style={
                                isAnyButtonSelected || (expired === true)
                                    ? {
                                        pointerEvents: 'none',
                                        color: 'rgba(0,0,0,0.5)',
                                        border: '1px solid rgba(0,0,0,0.5)',
                                        background: '#fff',
                                        wordBreak: "break-word",
                                    }
                                    : {
                                        background: '#fff',
                                        boxShadow: '0px 2px 4px 0px #00000033',
                                        wordBreak: "break-word",
                                    }
                            }
                        >
                            {optionText}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default ButtonsMessage;
