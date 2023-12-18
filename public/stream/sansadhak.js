function sansadhak(projectId, type = "web") {
  // sansadhak dev endpoint
  // const chatbotEndpoint = 'https://sansadhak.reverieinc.com';
  const sansadhakEndpoint = 'https://sansadhak-dev.reverieinc.com';

  // sansadhak prod endpoint 
  // const sansadhakEndpoint = 'https://revdrgw.reverieinc.com';
  // const chatbotEndpoint = 'https://chat-sansadhak.reverieinc.com';

  // Local
  const chatbotEndpoint = "https://3e76-2405-201-a405-e8b3-e91b-f462-b3a3-22da.ngrok-free.app";
  // const sansadhakEndpoint = "http://localhost:5000";
  
  fetch(`${sansadhakEndpoint}/api/bot/deploy/details`, {
    method: 'post',
    body: JSON.stringify({ projectId }),
    headers: {
      'Content-Type': 'application/json',
      'REV-APPNAME': 'sansadhak',
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((body) => {
      console.log(body);
      if (!body) return;
      const root = document.createElement('div');
      root.id = 'sansadhak-root';
      document.body.append(root);
      // window.sansadhakProject = body.data.project;
      // window.sansadhakModel = body.data.model;
      window.sansadhakTestDetails = body?.data?.testDetails;
      window.sansadhakStyles = body?.data?.botStyle;
      window.sansadhaksttVariablesInfo=body?.data?.sttVariablesInfo;
      window.sansadhakProjectId = projectId;
      window.sansadhakBotType = type;
      const jqueryScript = document.createElement('script');
      jqueryScript.src = 'https://code.jquery.com/jquery-3.4.1.js';
      jqueryScript.id = 'jqueryReverie';
      // jqueryScript.async = false;
      // jqueryScript.defer = false;
      const head = document.head || document.getElementsByTagName('head')[0];
      document.body.append(jqueryScript);
      document.getElementById('jqueryReverie').addEventListener('load', () => {
        // $("#root").html("Worked");
        const swalekhScript = document.createElement('script');
        swalekhScript.async = false;
        swalekhScript.src = `${chatbotEndpoint}/swalekh.js`;
        document.body.append(swalekhScript);
        const reactScript = document.createElement('script');
        reactScript.src = `${chatbotEndpoint}/static/js/main.js`;
        reactScript.defer = 'defer';
        reactScript.type = 'text/javascript';
        head.append(reactScript);
        const cssScript = document.createElement('link');
        cssScript.href = `${chatbotEndpoint}/static/css/main.css`;
        cssScript.rel = 'stylesheet';
        head.append(cssScript);

        // reverie stt api keys
        const sttApiKey = "84148cc0e57e75c7d1b1331bb99a2e94aa588d48";
        const sttAppId = "rev.stt_tts";
        const sttAppName = "stt_stream";

        window.STT_API =
          `wss://revapi.reverieinc.com/stream?src_lang=en&apikey=${sttApiKey}&domain=generic&silence=2&appid=${sttAppId}&appname=${sttAppName}&continuous=0`;
        window.fullStop = '.';
        const workerScript = document.createElement('script');
        workerScript.type = 'worker';
        workerScript.id = 'sansadhakWorker';
        workerScript.innerHTML = `importScripts("${chatbotEndpoint}/stream/recorderWorker.js");`;
        document.body.append(workerScript);
        const dictateScript = document.createElement('script');
        dictateScript.async = false;
        dictateScript.src = `${chatbotEndpoint}/stream/dictate.js`;
        document.body.append(dictateScript);
        const recorderScript = document.createElement('script');
        recorderScript.async = false;
        recorderScript.src = `${chatbotEndpoint}/stream/recorder.js`;
        document.body.append(recorderScript);
        const reverieScript = document.createElement('script');
        reverieScript.src = `${chatbotEndpoint}/stream/reverie.js`;
        reverieScript.async = false;
        document.body.append(reverieScript);
      });
    });
}
