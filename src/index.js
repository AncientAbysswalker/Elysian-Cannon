import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// Development build or production?
const isDev = window.require('electron-is-dev');

// Render application
ReactDOM.render(<App />, document.getElementById('root'));

// // Handle application file-drag functionality
// window.addEventListener('dragover', event => window.require('electron').remote.getCurrentWindow().setIgnoreMouseEvents(true, {forward: true}));
// window.addEventListener('drop', event => window.require('electron').remote.getCurrentWindow().setIgnoreMouseEvents(false));

// Handle application click-through functionality
if (!isDev) {
  window.addEventListener('mousemove', event => {
    if (!event.target.classList.contains('tangible')) {
      window.require('electron').remote.getCurrentWindow().setIgnoreMouseEvents(true, {forward: true})
    } else {
      window.require('electron').remote.getCurrentWindow().setIgnoreMouseEvents(false)
    }
  })
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
