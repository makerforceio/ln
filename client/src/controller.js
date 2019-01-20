import AnimeClass from './animeclass'

export default class ViewController {
  constructor() {
    this.animeclass = new AnimeClass()
  }
  
  home() {
    this.switchviewelement('home')
  }

  graph(searchterm) {
    document.querySelector('#searchterm').innerHTML = this.sanitizeHTML(searchterm)
    this.switchviewelement('graphview')
  }

  summary(searchterm) {
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
      this.animeclass.animate_in(id1)
    else 
      this.animeclass.animate_between(id1, id2)
  }

  sanitizeHTML(str) {
	  var temp = document.createElement('div');
	  temp.textContent = str;
	  return temp.innerHTML;
  }
}
