// Global UI elements:
//  - log: event log
//  - trans: transcription window

// Global objects:
//  - isConnected: true iff we are connected to a worker
//  - tt: simple structure for managing the list of hypotheses
//  - dictate: dictate object with control methods 'init', 'startListening', ...
//       and event callbacks onResults, onError, ...
var isConnected = false;

// var tt = new Transcription();

var startPosition = 0;
var endPosition = 0;
var doUpper = false;
var doPrependSpace = false;

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function prettyfyHyp(text, doCapFirst, doPrependSpace) {
	if (doCapFirst) {
		text = capitaliseFirstLetter(text);
	}
	tokens = text.split(" ");
	text = "";
	if (doPrependSpace) {
		text = " ";
	}
	doCapitalizeNext = false;
	tokens.map(function(token) {
		if (text.trim().length > 0) {
			text = text + " ";
		}
		if (doCapitalizeNext) {
			text = text + capitaliseFirstLetter(token);
		} else {
			text = text + token;
		}
		if (token == "." ||  /\n$/.test(token)) {							
			doCapitalizeNext = true;
		} else {
			doCapitalizeNext = false;
		}						
	});
	
	text = text.replace(/ ([,.!?:;])/g,  "\$1");
	text = text.replace(/ ?\n ?/g,  "\n");
	return text;
}	

// get the botVoice from style object in the botStyle
const botStyle = window.sansadhakStyles?.style;
let botVoice = botStyle.hasOwnProperty('botVoice') ? botStyle?.botVoice : true;

console.log('server', window.STT_API);
var dictate = new Dictate({
		server : window.STT_API,
		serverStatus : '',
		recorderWorkerPath : './stream/recorderWorker.js',
		botVoice: botVoice,
		onReadyForSpeech : function() {
			isConnected = true;
			__message("READY FOR SPEECH");
			// $("#buttonToggleListening").html(html);
			// $("#buttonToggleListening").addClass('inactive');
			// Previos without pulse 2 lines
			// $('.start-recording').addClass("inactive");
			// $('.stop-recording').removeClass("inactive");
			// With pulse
			// $('.voice-container').addClass('active');
			// window.setBotListening(true);
			// $("#buttonToggleListening").prop("disabled", false);
			// $("#buttonToggleListening").prop("danger", true);
			$("#buttonCancel").prop("disabled", false);
			// startPosition = $("#textarea").prop("selectionStart");
			// endPosition = startPosition;
			// var textBeforeCaret = $("#textarea").val().slice(0, startPosition);
			// if ((textBeforeCaret.length == 0) || /\. *$/.test(textBeforeCaret) ||  /\n *$/.test(textBeforeCaret)) {
			// 	doUpper = true;
			// } else {
			// 	doUpper = false;
			// }
			// doPrependSpace = (textBeforeCaret.length > 0) && !(/\n *$/.test(textBeforeCaret));
		},
		onEndOfSpeech : function() {
			__message("END OF SPEECH");
			// $("#buttonToggleListening").html('Stopping...');
			// $("#buttonToggleListening").prop("disabled", true);
		},
		onEndOfSession : function() {
			isConnected = false;
			__message("END OF SESSION");
			// $("#buttonToggleListening").html('Start Recording');
			// $("#buttonToggleListening").removeClass('ant-btn-dangerous');
			// $("#buttonToggleListening").html = "Hello"
			// $("#buttonToggleListening").prop("disabled", false);
			// $("#buttonCancel").prop("disabled", true);
			// Previos without pulse 2 lines
			// $('.stop-recording').addClass("inactive");
			// $('.start-recording').removeClass("inactive");
			// With pulse
			// $('.voice-container').removeClass("active");
			// window.setBotListening(false);
			$("#display_text").html('');
			// let val = $("#textarea").val();
			// val = val + " ";
			// $("#textarea").val(val);
			// $("#textarea").focus();
			const element = document.getElementById('textarea');
			element.focus();
			element.setSelectionRange(element.value.length,element.value.length);
			$('.click').click();
		},
		onServerStatus : function(json) {
			__serverStatus(json.num_workers_available);
			$("#serverStatusBar").toggleClass("highlight", json.num_workers_available == 0);
			// If there are no workers and we are currently not connected
			// then disable the Start/Stop button.
			if (json.num_workers_available == 0 && ! isConnected) {
				$("#buttonToggleListening").prop("disabled", true);
			} else {
				$("#buttonToggleListening").prop("disabled", false);
			}
		},
		onPartialResults : function(hypos) {
			// hypText = prettyfyHyp(hypos, doUpper, doPrependSpace);
			let hypText = hypos
			console.log('hypText partial', hypText);

			// remove <unknown> from the text
			// hypText = hypText.replace(/<unknown>/g, '');

			// remove space from the end of the text
			// hypText = hypText.replace(/ $/g, '');

			// val = $("#textarea").val();
			// $("#textarea").val(val.slice(0, startPosition) + hypText + val.slice(endPosition));        
			// window.setBotMessage(val.slice(0, startPosition) + hypText + val.slice(endPosition));
			endPosition = startPosition + hypText.length;
			// $("#textarea").prop("selectionStart", endPosition);
			// $("#display_text").text(hypos);
			// const target = document.getElementById('textarea');
			// target.style.height = "0px"
			// window.textareaHeight(target.scrollHeight);
			// target.style.height = `${target.scrollHeight}px`;
		},
		onResults : function(hypos, words) {
			console.log('hypos', hypos, words);
			new_hypos = hypos

			// words.forEach(function (item, index) {
			// 	if (item.word.length == 1){
			// 		if(item.confidence < 0.5){
			// 			return;
			// 		}
			// 	}
			// 	else{
			// 		new_hypos = new_hypos + " " + item.word;
			// 	}
			// });

			if(new_hypos != ""){
				new_hypos = new_hypos + "। "
			}

			// hypText = prettyfyHyp(new_hypos, doUpper, doPrependSpace);
			let hypText = hypos

			console.log({hypos, hypText})

			// remove <unknown> from the text
			// hypText = hypText.replace(/<unknown>/g, '');

			// remove space from the end of the text
			// hypText = hypText.replace(/ $/g, '');

			console.log({hypText})

			console.log('hypText', hypText);
			// val = $("#textarea").val();
			// $("#textarea").val(val.slice(0, startPosition) + hypText + val.slice(endPosition));        
			// window.setBotMessage(val.slice(0, startPosition) + hypText + val.slice(endPosition));
			// window.sendBotMessage(val.slice(0, startPosition) + hypText + val.slice(endPosition));
			startPosition = startPosition + hypText.length;			
			endPosition = startPosition;
			// $("#textarea").prop("selectionStart", endPosition);
			// const target = document.getElementById('textarea');
			// target.style.height = "0px"
			// window.textareaHeight(target.scrollHeight);
			// target.style.height = `${target.scrollHeight}px`;
		},
		onError : function(code, data) {
			dictate.cancel();
			__error(code, data);
			console.log(code, data);
			// TODO: show error in the GUI
		},
		onEvent : function(code, data) {
			__message(code, data);
		}
	});

// Private methods (called from the callbacks)
function __message(code, data) {
	if (typeof(log) != 'undefined' && log != null) {
		log.innerHTML = "msg: " + code + ": " + (data || '') + "\n" + log.innerHTML;
	}
}

function __error(code, data) {
	if (typeof(log) != 'undefined' && log != null) {
		log.innerHTML = "ERR: " + code + ": " + (data || '') + "\n" + log.innerHTML;
	}
}

function __serverStatus(msg) {
	// serverStatusBar.innerHTML = msg;
}

function __updateTranscript(text) {
	$("#textarea").val(text);
	$("#display_text").text(text);
}

// Public methods (called from the GUI)
function toggleListening() {
	// console.log('stt_api', window.STT_API);
	// console.log('recording start', window.STT_API);
	if (isConnected) {
		console.log('recording stopping')
		dictate.stopListening();
	} else {
		console.log('recording starting')
		dictate.startListening();
	}
}

function startListening() {
	dictate.startListening()
}

function stopListening() {
	console.log("stopping listening")
	dictate.stopListening();
}

function sendEOFToServer(buffer) {
	console.log("sendEOFToServer")
	dictate.sendEOFToServer(buffer)
}

function cancel() {
	dictate.cancel();
}

function clearTranscription() {	
	$("#textarea").val("");
	// needed, otherwise selectionStart will retain its old value
	$("#textarea").prop("selectionStart", 0);	
	$("#textarea").prop("selectionEnd", 0);	
}

$(document).ready(function() {
	dictate.init();

	$("#servers").change(function() {
		dictate.cancel();
		var servers = $("#servers").val().split('|');
		dictate.setServer(servers[0]);
		dictate.setServerStatus(servers[1]);
	});

});
