class Coordinator {
  constructor() {
    this.firstFrame = [];
    this.secondFrame = [];
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
    this.firstFrame.push(animation);
    this.requestFrame();
  }
  
  requestFrame() {
    if(this.requestId !== 0)
      return;
    
    this.requestId = window.requestAnimationFrame(this.onFrameFunc);
  }
  
  onFrame() {
    console.log(this.requestId, this.firstFrame, this.secondFrame);
    this.requestId = 0;
    
    for(let f of this.firstFrame)
      f.firstFrame();
    
    for(let s of this.secondFrame)
      s.secondFrame();
    
    this.secondFrame.forEach((a)=>{this.pending.set(a.target, a)});
    
    this.secondFrame = this.firstFrame;
    this.firstFrame = [];
    
    if(this.secondFrame.length > 0)
      this.requestFrame();
  } 
}

Coordinator.active = new Coordinator();