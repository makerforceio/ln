import 'babel-polyfill';

import AnimeClass from './animeclass';
import Logic from './logic';
import Grapher from './graph';
import ViewController from './controller'; 

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("Pew everything is loaded")
  let controller = new ViewController()
  controller.home()

  setTimeout(function() {
      controller.graph('Space')
  }, 3000)

  setTimeout(function() {
      console.log('summary')
      controller.summary('Space')
  }, 6000)

  let grapher = new Grapher({
    "nodes": [
      {"id": "1", "title": "Cryptocurrency"},
      {"id": "2", "title": "Stuff"},
      {"id": "3", "title": "More Stuff"},
    ],
    "links": [
      {"source": "1", "target": "2", "value": "1"},
      {"source": "1", "target": "3", "value": "5"},
      {"source": "3", "target": "2", "value": "3"}
    ]
  })
  
  grapher.construct_graph().then(function(d) {
    console.log(d)
  })
})

window.Logic = Logic;

// vim: ts=2:ss=2:sw=2:et
