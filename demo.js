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
  DeltaAnimation.animateChange(
    ()=>{
      for(let i = 0; i< container.children.length; i++) updateViz(i);
    }, 
    (differences)=>{
      differences.forEach((c)=>{
        if(Diff.Move === c.action)
          TransformAnimation.ofTranslation(c.node, c.previousState, c.nextState).play()
      })
    }
  );
}

function fade() {
  DeltaAnimation.animateChange(
    ()=>{
      for(let i = 0; i< container.children.length; i++) {
        updateViz(i);
      }
    },
    (differences)=>{
      let exit = differences.filter(c=>Diff.Exit === c.action);
      let move = differences.filter(c=>Diff.Move === c.action);
      let enter = differences.filter(c=>Diff.Enter === c.action);
      
      move = move.map(c=>TransformAnimation.ofTranslation(c.node, c.previousState, c.nextState).play().promise);
      enter = enter.map(c=>new FadeInAnimation(c.node));

      DeltaAnimation.animateChange(()=>{}, ()=>{enter.forEach(a=>a.play())});
    }
  );
}

function addMore(e) {
  // save this info because the event may be reused by the time
  // processing occurs
  let target = e.currentTarget;
  let parent = target.parentElement;
  let duplicate = parent.firstElementChild.cloneNode(true);

  DeltaAnimation.animateChange(
    ()=>{
      parent.insertBefore(duplicate, target);
    },
    (differences)=>{
      differences.forEach((c)=>{
        if(Diff.Move === c.action) 
          TransformAnimation.ofTranslation(c.node, c.previousState, c.nextState).play();
        else if (Diff.Enter === c.action)
          new FadeInAnimation(c.node).play();
      });
    }
  );
}