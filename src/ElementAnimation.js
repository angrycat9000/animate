let AnimationType = {
  Animation: 'animation',
  Transition: 'transition',
  Unknown: '',
};

let AnimationState = {
  None: 'none',                     // no set up done yet.
  Initialized: 'init',              // frame one set, but not ready for frame 2
  Ready: 'ready',                   // ready to play frame 2
  PendingComplete : 'playing',      // frame 2 - N
  Complete: 'complete'              // finished and cleaned up
  
  // Frame One    Construction
  
  // Frame 2      Play
  
  // Frame N+1    Cleanup
}

class ElementAnimation {
  /**
  * @param {HTMLElement} target
  */
  constructor(target) {
    this.target = target;
    this.state = AnimationState.None;
  }
  
  /**
  *
  */
  play() {
    Coordinator.addAnimation(this);
    return this;
  }
  
  /**
  * Call to set up the first frame of the animation
  */
  firstFrame() {
  }
  
  /**
  * Called to set up the second frame of the animation.  Useful
  * if using the transition property instead of animation keyframes
  */
  secondFrame() {
  }
  
  /**
  * Called after the animation is finished.  Classes extending this should
  * call super.afterComplete AFTER they have finished their work.
  */
  afterComplete(wasCanceled) {
    console.debug('ElementAnimation.afterComplete', this.target);
    this.isComplete = true;
    if(this.resolveNotify)
      this.resolveNotify();
  }
  
  get animationType() {
    return AnimationType.Unknown
  }
  
  /**
  *
  */
  get promise() {
    this._promise = this._promise || new Promise((resolve, reject)=>{
      if(this.isComplete)
        return Promise.resolve();

      this.resolveNotify = resolve;
    });

    return this._promise;
  }
  
  /**
  *
  */
  then(onResolve, onReject) {
    return this.promise.then(onResolve, onReject);
  }

  toString() {
    return 'ElementAnimation' + this.target;
  }
}
  
  
class TransformAnimation extends ElementAnimation {
  /**
  * @param {HTMLElement} target
  * @param {State} previous
  */
  constructor(target, options) {
    super(target);
    
    options = options || {};

    this.translateX = TransformAnimation.parseTranslate(options.translateX);
    this.translateY = TransformAnimation.parseTranslate(options.translateY);
    this.scaleX = TransformAnimation.parseScale(options.scaleX);
    this.scaleY = TransformAnimation.parseScale(options.scaleY);
    
    this.baseTransform = window.getComputedStyle(this.target).transform;
    this.inlineTransform = this.target.style.transform;
    
    this.firstFrame();
  }
  
  toString() {
    return `TransformAnimation (t=${this.translateX},${this.translateY} s=${this.scaleX}, ${this.scaleY}) ${this.target}`;
  }
  
  get animationType() {
    return AnimationType.Transition
  }
  
  static parseTranslate(t) {
    return t || 0;
  }
  
  static parseScale(s) {
    let scale = Number(s);
    if(Number.isNaN(scale))
      return 1;
    return scale;
  }
  
  static ofTranslation(element, previous, next) {
    let options = {};
    options.translateX = previous.left - next.left;
    options.translateY = previous.top - next.top;
    /*options.scaleX = next.width > 0 ? previous.width / next.width : 0;
    options.scaleY = next.height > 0 ? previous.height /next.height : 0;*/
    return new TransformAnimation(element, options);
  }
 
  firstFrame() {
    console.debug('TransformAnimation.firstFrame', this.target)
    let transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scaleX}, ${this.scaleY})`;
    
    if(this.baseTransform && 'none' !== this.baseTransform)
      transform += ' ' + this.baseTransform

    this.target.style.transform = transform;
  
  }
  
  secondFrame() {
    console.debug('TransformAnimation.secondFrame', this.target, this)
    this.target.classList.add('animate--transform');
    this.target.style.transform = this.inlineTransform;
  }
  
  afterComplete() {
    this.target.classList.remove('animate--transform');
    super.afterComplete();
  }
}

/**
*
*/
class FadeInAnimation extends ElementAnimation {
  constructor(element) {
    super(element);
    this.firstFrame();
  }
  toString() {
    return 'FadeIn ' + this.target.ToString();
  }
  
  firstFrame() {
    this.target.style.opacity = 0;
  }
  
  secondFrame() {
    this.target.classList.add('animate--opacity');
    this.target.style.opacity = '';
  }
  
  afterComplete() {
    this.target.classList.remove('animate--opacity');
    super.afterComplete();
  }
}


/**
*
*/
class RiseAndFadeAnimation extends ElementAnimation {
  constructor(element) {
    super(element);
    this.firstFrame();
  }
  toString() {
    return 'Rise+Fade ' + this.target.ToString();
  }
  
  firstFrame() {
    this.target.style.opacity = 0;
    this.target.style.transform = 'scale(0.8,0.8)';
  }
  
  secondFrame() {
    this.target.classList.add('animate--transform', 'animate--opacity');
    this.target.style.opacity = '';
    this.target.style.transform = '';
  }
  
  afterComplete() {
    this.target.classList.remove('animate--transform', 'animate--opacity');
    super.afterComplete();
  }
}

/**
 * 
 */
class ExitAnimation extends ElementAnimation {

  /**
   * 
   * @param {HTMLElement} target 
   * @param {State} previous 
   * @param {State} current 
   */
  constructor(target, previous, current) {
    super(target);
    this.previous = previous;
    this.current = current;
    this.current.snapshotStyle(['top', 'left', 'display', 'opacity', 'position', 'margin'])
  }

  revive() {
    if(null == this.target.parentElement) {
      this.killAction = 'remove';
      this.previous.parentElement.appendChild(this.target);
    } else if (this.current.computedStyle.display = 'none') {
      this.killAction = 'display';
      this.target.style.display = this.previous.computedStyle.display;
    }

    this.target.style.position = 'absolute';

    let parentPosition =   this.target.offsetParent.getBoundingClientRect();
    this.target.style.top = (this.previous.top -  parentPosition.top) + 'px';
    this.target.style.left = (this.previous.left  - parentPosition.left) + 'px';
    this.target.style.margin = 0;
  }


  afterComplete(wasCanceled) {
    if('remove' === this.killAction)
      this.target.parentElement.removeChild(this.target);

    this.current.restoreStyle(this.target);
    super.afterComplete(wasCanceled);
  }


}

/**
*
*/
class FadeOutAnimation extends ExitAnimation {
  constructor(element, previous, next) {
    super(element, previous, next);
    this.firstFrame();
  }
  
  get animationType() {
    return AnimationType.Transition
  }
  
  firstFrame() {
    this.revive();
    this.target.style.opacity = 1;
  }
  
  secondFrame() {
    this.target.classList.add('animate--opacity');
    this.target.style.opacity = 0;
  }
  
  afterComplete(wasCanceled) {
    this.target.classList.remove('animate--opacity');
    super.afterComplete(wasCanceled);
  }
}

/**
 * 
 */
class DropAndFadeAnimation extends ExitAnimation {
  constructor(target, previous, current) {
    super(target, previous, current);

    this.current.snapshotStyle(['transform', 'opacity']);
    this.firstFrame();
  }

  firstFrame() {
    this.revive();
    this.target.style.opacity = 1;
    this.target.style.transform = 'scale(1,1)';
  }

  secondFrame() {
    this.target.classList.add('animate--transform', 'animate--opacity');
    this.target.style.opacity = 0;
    this.target.style.transform = 'scale(0.8, 0.8)';
  }

  afterComplete(wasCanceled) {
    this.target.classList.remove('animate--transform', 'animate--opacity');
    super.afterComplete(wasCanceled);
  }
}
