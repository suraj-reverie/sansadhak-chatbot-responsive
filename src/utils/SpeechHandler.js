import { Buffer } from "buffer";
// const { Buffer } = require('buffer');
import $ from 'jquery';

var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

class SpeechHandler {
    constructor() {
        this.eventListener = [];
        this.speechEngine = 'reverie';
        this.listening = false;
        this.language = 'en';
        this.status = 'standby';
        this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
        if (this.recognition) {
            this.recognition.interimResults = true;
            this.recognition.continuous = true;
        }
    }

    setConfig(config) {
        if (this.listening) {
            this.stopListening();
        }
        const { speechEngine, on } = config;
        if (speechEngine === 'reverie') {
            this.speechEngine = 'reverie';
            const { server } = config;
            if (server !== 'current') {
                window.dictate.setServer(server);
            }
            window.dictate.setEventHandler(this.onEvent.bind(this));
            // console.log(onResults);
        } else {
            const { language } = config;
            this.speechEngine = 'mozilla';
            this.language = language;
            this.recognition.lang = language;
        }
        this.on = on;
    }

    startListening() {
        if (this.listening || (this.status === 'starting' && this.loading)) {
            this.on('abort', { success: false, message: 'Mic Already Listening' });
            return;
        }
        if (this.speechEngine === 'reverie') {
            window.startListening();
            this.status = 'starting';
            this.loading = true;
            this.on('starting', { listening: this.listening, loading: this.loading });
        } else {
            this.recognition.start();
            this.status = 'starting';
            this.loading = true;
            this.on('starting', { listening: this.listening, loading: this.loading });
            this.recognition.onstart = () => {
                this.loading = false;
                this.listening = true;
                this.status = 'listening'
                this.onEvent(9);
            }
            this.recognition.onend = () => {
                this.loading = false;
                this.listening = false;
                this.status = 'standby';
                this.onEvent(10);
            }
            this.recognition.onresult = (event) => {
                const data = event.results[0][0].transcript;
                const updatedData = this.removeSpace(data);
                const isFinal = event.results[0].isFinal;
                const cause = isFinal ? 'final' : 'partial';
                this.onEvent(8, { cause: cause, display_text: updatedData });
            }
        }
    }

    stopListening() {
        if (this.loading && this.listening) {
            this.on('abort', { success: false, message: 'Already Stopping' })
            return;
        }
        if (this.speechEngine === 'reverie') {
            const buf = Buffer.from('--EOF--');
            window.sendEOFToServer(buf);
            // window.stopListening();
            // this.on('stopping', { listening: this.listening, loading: this.loading });
        } else {
            this.recognition.stop();
            this.on('stopping', { listening: this.listening, loading: this.loading });
        }
    }

    // function to remove space from string if the string contains only numbers and spaces
    removeSpace(str) {
        if (str) {
            const regex = /^[0-9\s]*$/;
            if (regex.test(str)) {
                return str.replace(/\s/g, '');
            }
        }
        return str;
    }

    // MSG_WAITING_MICROPHONE = 1;
    // MSG_MEDIA_STREAM_CREATED = 2;
    // MSG_INIT_RECORDER = 3;
    // MSG_RECORDING = 4;
    // MSG_SEND = 5;
    // MSG_SEND_EMPTY = 6;
    // MSG_SEND_EOS = 7;
    // MSG_WEB_SOCKET = 8;
    // MSG_WEB_SOCKET_OPEN = 9;
    // MSG_WEB_SOCKET_CLOSE = 10;
    // MSG_STOP = 11;
    // MSG_SERVER_CHANGED = 12;
    // MSG_AUDIOCONTEXT_RESUMED = 13;

    onEvent(code, data) {
        if (code === 9) {
            // console.log(code, data);
            this.loading = false;
            this.listening = true;
            this.status = 'listening'
            this.on('started', { listening: this.listening, loading: this.loading });
        }
        if (code === 10) {
            this.loading = false;
            this.listening = false;
            this.status = 'standby';
            console.log("coming here in code 8")
            this.on('stopped', { listening: this.listening, loading: this.loading })

            // manually remove active class
            this.removeActiveClass();
        }
        if (code === 8) {
            const partial = true;
            const result = this.speechEngine === 'reverie' ? JSON.parse(data).display_text : data.display_text;
            console.log({result, speech:this.speechEngine});
            this.on('results', result);
        }
    }

    // function to remove active class to voice-container class
    removeActiveClass() {
        $('.voice-container').removeClass('active');
    }

}

export const speechHandler = new SpeechHandler();