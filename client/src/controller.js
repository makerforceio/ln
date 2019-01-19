import AnimeClass from './animeclass'

export default class ViewController {
  constructor() {
    this.animeclass = new AnimeClass()
  }
  
  home() {
    this.switchviewelement('home')
    this.animeclass.animate_intro()
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
    document.querySelectorAll('.container').forEach((elem) => {
      (elem.id == id) ? (elem.style.display = 'flex') : (elem.style.display = 'none')
    })
  }

  sanitizeHTML(str) {
	  var temp = document.createElement('div');
	  temp.textContent = str;
	  return temp.innerHTML;
  }
}
