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
    (compare)=>{
      compare.differences.forEach((c)=>{
        if(Diff.Move == c.action)
          TransformAnimation.ofTranslation(c.node, c.previous, c.next).play()
        else if(Diff.Enter == c.action)
          new TransformAnimation(c.node,{scaleY:0}).play()
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
    (compare)=>{
      let enter = [], 
          move= [],  
          exit = [];

      // process in order found so parents are proccessed before children
      compare.differences.forEach(d=>{
        if(Diff.Exit == d.action && compare.isExitRoot(d.node))
          exit.push(new DropAndFadeAnimation(d.node, d.previous, d.next).play())
        else if(Diff.Move == d.action)
          move.push(TransformAnimation.ofTranslation(d.node, d.previous, d.next))
        else if(Diff.Enter == d.action)
          enter.push(new RiseAndFadeAnimation(d.node))
      })

      Promise.all(exit.map(a=>a.promise))
      .then(()=>Promise.all(move.map(a=>a.play().promise)))
      .then(()=>{enter.forEach(a=>a.play())});




      //DeltaAnimation.animateChange(()=>{}, ()=>{enter.forEach(a=>a.play())});
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
    (compare)=>{
      compare.differences.forEach((c)=>{
        if(Diff.Move === c.action) 
          new TransformAnimation(c.node,
            {translateX: c.netTranslation.left, translateY:c.netTranslation.top}).play();
        else if (Diff.Enter === c.action)
          new FadeInAnimation(c.node).play();
      });
    }
  );
}