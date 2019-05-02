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
  let compare = new StateComparison();
  
  for(let i = 0; i< container.children.length; i++) {
    updateViz(i);
  }
  
  compare.compare();
  compare.differences.forEach((c)=>{
    if(Diff.Move === c.action)
      TransformAnimation.ofTranslation(c.node, c.previousState, c.nextState)
  });
  /*compare.enter.forEach((c)=>{
    new TransformAnimation(c.node, {scaleY:0});
  })*/
}

function fade() {
  let compare = new StateComparison();
  
  for(let i = 0; i< container.children.length; i++) {
    updateViz(i);
  }
  
  compare.compare();
  compare.differences.forEach((c)=>{
    if(Diff.Enter === c.action)
      new FadeInAnimation(c.node);
  });

}

function addMore(e) {
  let parent = e.currentTarget.parentElement;
  let duplicate = parent.firstElementChild.cloneNode(true);
  
  let compare = new StateComparison();
  
  parent.insertBefore(duplicate, e.currentTarget);
  
  new FadeInAnimation(duplicate);
  
  compare.compare();
   
  compare.differences.forEach((c)=>{
    if(Diff.Move === c.action) 
      TransformAnimation.ofTranslation(c.node, c.previousState, c.nextState);
  });
}