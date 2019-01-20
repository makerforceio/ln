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
  
  async updateTopics(query) {
    const res = await this.#logic.search(query);
    const results = res[1];
    const links = res[3].map(l => l.split('/').pop());

    const html = results.map((r, i) => `
      <li onclick="window.controller.graph('${links[i]}')">${r}</li>
    `).join('');

    document.querySelector('#suggest').innerHTML = html;
  }

  async graph(searchterm) {
    const stuff = await this.#logic.graphMapped(searchterm);
    const grapher = new Grapher(stuff);
    grapher.construct_graph().then((topic) => {
      this.summary(topic);
    });

    document.querySelector('#searchterm').innerText = searchterm;
    this.switchviewelement('graphview')
  }

  async summary(topic) {
    const cards = await this.#logic.cards(topic.name);

    const html = cards.map(c => `
      <div class="card"
        ${c.type == 'image' ? `style="background: url('${c.image}'); background-size: cover;"` : ''}
        >
        ${do {
          if (c.type == 'image') {
            ``;
          } else if (c.type == 'paragraph') {
            `
              <h1>${c.title}</h1>
              <!-- <span class="badge">wikipedia.com</span> -->
              <!-- <span class="badge">summary</span> -->
              <p id="cardtext">${c.content}</p>
            `;
          } else if (c.type == 'link') {
            `

            `;
          } else {
            ``;
          }
        }}
      </div>
    `).join('');

    document.querySelector('#summarytitle').innerText = topic.title;
    document.querySelector('#summarycards').innerHTML = html;
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
