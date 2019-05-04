var Coordinator = {
  secondFrame: [],
  pending: new Map(),
  requestId: 0,
  subscribed: false,
  changes: [],
}

  
Coordinator.subscribe = function() {
  if(this.subscribed)
    return;
  
  document.body.addEventListener('animationend', Coordinator.onAnimationEnd);
  document.body.addEventListener('animationcancel', Coordinator.onAnimationCancel);
  
  document.body.addEventListener('transitionend', Coordinator.onTransitionEnd);
  document.body.addEventListener('transitioncancel', Coordinator.onTransitionCancel);
  
  this.subscribed = true;
}
  
Coordinator.unsubscribe = function() {
  if(this.subscribed)
    return;
  
  document.body.removeEventListener('animationend', Coordinator.onAnimationEnd);
  document.body.removeEventListener('animationcancel', Coordinator.onAnimationCancel);
  
  document.body.removeEventListener('transitionend', Coordinator.onTransitionEnd);
  document.body.removeEventListener('transitioncancel', Coordinator.onTransitionCancel);
  
  this.subscribed = false;
}
  
Coordinator.onAnimationEnd = function(e) {Coordinator.onFinish(e.target, false)}
Coordinator.onAnimationCancel = function(e) {Coordinator.onFinish(e.target, true)}
Coordinator.onTransitionEnd = function(e) {Coordinator.onFinish(e.target, false)}
Coordinator.onTransitionCancel = function(e) {Coordinator.onFinish(e.target, true)}
  
Coordinator.onFinish = function(element, wasCanceled) {
  console.debug('Coordinator.OnFinish', element, wasCanceled)
  let animation = this.pending.get(element);
  if(!animation)
    return;
  
  this.pending.delete(element);
  
  animation.afterComplete(wasCanceled);
}

Coordinator.scheduleChange = function(f) {
  Coordinator.changes.push(f);
  Coordinator.requestFrame();
}
  
Coordinator.addAnimation = function(animation) {
  console.debug('Coordinator.addAnimation', animation)
  this.secondFrame.push(animation);
  this.subscribe();
  this.requestFrame();
}
  
Coordinator.requestFrame = function() {
  console.debug('Coordinator.requestFrame', this.requestId)
  if(this.requestId !== 0)
    return;
  
  this.requestId = window.requestAnimationFrame(Coordinator.onFrameFunc);
}
  
Coordinator.onFrame = function() {
  console.group('Coordinator.onFrame', this.requestId);
  this.requestId = 0;

  if(0 === this.pending.size && this.secondFrame.length)
    this.processAnimation();
  if(0 === this.pending.size && this.changes.length > 0)
    this.processChanges();

  if(this.changes.length || this.secondFrame.length)
    this.requestFrame(); 
  console.groupEnd();
} 
Coordinator.onFrameFunc = Coordinator.onFrame.bind(Coordinator);

Coordinator.processAnimation = function() {
  console.debug('Coordinator.processAnimation');
  for(let s of this.secondFrame)
    s.secondFrame();
  
  this.secondFrame.forEach((a)=>{this.pending.set(a.target, a)});
  
  this.secondFrame = []
}

Coordinator.processChanges = function() {
  console.debug('Coordinator.processChanges');

  // any changes added during this cycle have to wait until
  // next change cycle
  let activeChanges = this.changes;
  this.changes = [];

  let compare = new StateComparison();

  for(let c of activeChanges)
    c.change();

  compare.compare();

  for(let c of activeChanges)
    c.animation(compare.differences);
}