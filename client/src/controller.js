import AnimeClass from './animeclass'
import Grapher from './graph';

export default class ViewController {

  #logic = null;
  #animeclass = new AnimeClass();

  constructor(logic) {
    this.#logic = logic;
  }
  
  async home() {
    this.switchviewelement('home')
  }

  async graph(searchterm) {
    const stuff = await this.#logic.graphMapped(searchterm);
    const grapher = new Grapher(stuff);
    grapher.construct_graph().then((name) => {
      this.summary(name);
    });

    document.querySelector('#searchterm').innerHTML = this.sanitizeHTML(searchterm)
    this.switchviewelement('graphview')
  }

  async summary(name) {
    const cards = await this.#logic.cards(name);

    document.querySelector('#summarytitle').innerHTML = this.sanitizeHTML(searchterm)
    this.switchviewelement('summaryview')
  }

  switchviewelement(id) { 
    let id1, id2 = ''
    document.querySelectorAll('.container').forEach((elem) => {
      if(elem.id == id) {
        id1 = elem.id
      } else if (elem.style.display == 'flex') {
        id2 = elem.id
      } else {
        // Do nth
      }
    })

    console.log(id1)
    console.log(id2)
    
    if(id2 === '')
      this.#animeclass.animate_in(id1)
    else 
      this.#animeclass.animate_between(id1, id2)
  }

  sanitizeHTML(str) {
	  var temp = document.createElement('div');
	  temp.textContent = str;
	  return temp.innerHTML;
  }
}

// vim: ts=2:ss=2:sw=2:et
