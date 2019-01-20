import 'babel-polyfill';

import Logic from './logic';
import ViewController from './controller'; 

document.addEventListener("DOMContentLoaded", async (event) => {
  console.log("Pew everything is loaded")
  
  const logic = new Logic();
  window._logic = logic;
  
  const controller = new ViewController(logic)
  controller.home()
  window.controller = controller;

})

window.Logic = Logic;

// vim: ts=2:ss=2:sw=2:et
