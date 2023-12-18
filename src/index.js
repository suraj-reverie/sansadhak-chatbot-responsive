import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { CaptureConsole } from "@sentry/integrations";
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';


Sentry.init({
    dsn: "https://0dc844bf21758a6edd3d1b5217a9c1da@o4505786961166336.ingest.sentry.io/4505786963656704",
    integrations: [
        new Sentry.BrowserTracing({
            // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
            tracePropagationTargets: ["localhost", "https://voice-demo.reverieinc.com/"],
        }),
        new Sentry.Replay(),
        new CaptureConsole({levels: ['info']}),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    normalizeDepth: 10, // Adjust the stack trace depth to normalize the frames
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const root = ReactDOM.createRoot(document.getElementById('sansadhak-root'));
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
