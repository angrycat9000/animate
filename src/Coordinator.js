class Coordinator {
  constructor() {
    this.firstFrame = [];
    this.secondFrame = [];
    this.pending = [];
    this.onFrameFunc = this.onFrame.bind(this);
    this.requestId = 0;
    
  }
  
  static add(animation) {
    Coordinator.getCoordinator().add(animation);
  }
  
  static getCoordinator() {return Coordinator.active;}
  
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
    
    this.pending = this.pending.concat(this.secondFrame);
    this.secondFrame = this.firstFrame;
    this.firstFrame = [];
    
    if(this.secondFrame.length > 0)
      this.requestFrame();
  } 
}

Coordinator.active = new Coordinator();