var container, viz;

function ready() {
  container = document.getElementById('container');
  viz = document.getElementById('viz');
  
  for(let i = 0; i < container.children.length; i++) {
    let input = document.createElement('input');
    input.setAttribute('type','checkbox');
    input.setAttribute('checked',true);
    viz.appendChild(input);
  }  
}

if('loading' !== document.readyState)
  ready();
else
  window.addEventListener('DOMContentLoaded', ready);



function updateViz(i) {
  if(viz.children[i].checked)
    container.children[i].style.display='';
  else
    container.children[i].style.display='none';
}


function stretch() {
  let sc = new StretchAnimation(container, 'vertical');
  sc.duration = '1s';
  
  for(let i = 0; i< container.children.length; i++) {
    updateViz(i);
  }
  
  sc.animate();
}

function fade() {
  for(let i = 0; i< container.children.length; i++) {
    let fade = new FadeAnimation(container.children[i]);
    updateViz(i);
    fade.animate();
  }
}