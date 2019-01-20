import 'babel-polyfill';

import AnimeClass from './animeclass';
import Logic from './logic';
import Grapher from './graph';
import ViewController from './controller'; 

document.addEventListener("DOMContentLoaded", async (event) => {
  console.log("Pew everything is loaded")
  let controller = new ViewController()
  controller.graph('Space')

  const logic = new Logic();
  window.logic = logic;
  const stuff = await logic.graphMapped("Cryptocurrency");
  let grapher = new Grapher(stuff);
  
  grapher.construct_graph().then(function(d) {
    console.log(d)
  })
})

window.Logic = Logic;

// vim: ts=2:ss=2:sw=2:et
