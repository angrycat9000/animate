class Coordinator {
  constructor() {
    this.firstFrame = [];
    this.secondFrame = []
    this.pending = new Map();
    this.onFrameFunc = this.onFrame.bind(this);
    this.requestId = 0;
    this.subscribed = false;
  }
  
  subscribe() {
    if(this.subscribed)
      return;
    
    document.body.addEventListener('animationend', Coordinator.onAnimationEnd);
    document.body.addEventListener('animationcancel', Coordinator.onAnimationCancel);
    
    document.body.addEventListener('transitionend', Coordinator.onTransitionEnd);
    document.body.addEventListener('transitioncancel', Coordinator.onTransitionCancel);
    
    this.subscribed = true;
  }
  
  unsubscribe() {
    if(this.subscribed)
      return;
    
    document.body.removeEventListener('animationend', Coordinator.onAnimationEnd);
    document.body.removeEventListener('animationcancel', Coordinator.onAnimationCancel);
    
    document.body.removeEventListener('transitionend', Coordinator.onTransitionEnd);
    document.body.removeEventListener('transitioncancel', Coordinator.onTransitionCancel);
    
    this.subscribed = false;
  }
  
  static onAnimationEnd(e) {Coordinator.active.onFinish(e.target, false)}
  static onAnimationCancel(e) {Coordinator.active.onFinish(e.target, true)}
  static onTransitionEnd(e) {Coordinator.active.onFinish(e.target, false)}
  static onTransitionCancel(e) {Coordinator.active.onFinish(e.target, true)}
  
  onFinish(element, wasCanceled) {
    console.debug('Coordinator.OnFinish', element, wasCanceled)
    let animation = this.pending.get(element);
    if(!animation)
      return;
    
    this.pending.delete(element);
    
    animation.afterComplete(wasCanceled);
  }
  
  static add(animation) {
    Coordinator.active.add(animation);
    Coordinator.active.subscribe();
  }
  
  add(animation) {
    console.debug('Coordinator.Add', animation)
    this.firstFrame.push(animation);
    this.requestFrame();
  }
  
  requestFrame() {
    console.debug('Coordinator.RequestFrame', this.requestId)
    if(this.requestId !== 0)
      return;
    
    this.requestId = window.requestAnimationFrame(this.onFrameFunc);
  }
  
  onFrame() {
    console.group('Coordinator.OnFrame', this.requestId, this.ready);
    this.requestId = 0;
    
    for(let s of this.secondFrame)
      s.secondFrame();
    
    this.secondFrame.forEach((a)=>{this.pending.set(a.target, a)});
    
    this.secondFrame = this.firstFrame;
    this.firstFrame = [];
    
    if(this.secondFrame.length)
      this.requestFrame();
    
    console.groupEnd();
  } 
}

Coordinator.active = new Coordinator();