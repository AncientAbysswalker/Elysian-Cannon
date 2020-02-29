import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// Handle application click-through functionality
var t
window.addEventListener('mousemove', event => {
  if (!event.target.classList.contains('tangible')) {
    window.require('electron').remote.getCurrentWindow().setIgnoreMouseEvents(true, {forward: true})

    // Clear timeout and reset. Required or elements will remain intangible
    if (t) clearTimeout(t)
    t = setTimeout(function() {window.require('electron').remote.getCurrentWindow().setIgnoreMouseEvents(false)}, 150)
  } else {
    window.require('electron').remote.getCurrentWindow().setIgnoreMouseEvents(false)
  }
})

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
