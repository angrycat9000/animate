let AnimationType = {
  Animation: 'animation',
  Transition: 'transition',
  Unknown: '',
};

class ElementAnimation {
  /**
  * @param {HTMLElement} target
  */
  constructor(target) {
    this.target = target;
        
    Coordinator.add(this);
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
    options.translateX = previous.offsetLeft - next.offsetLeft;
    options.translateY = previous.offsetTop - next.offsetTop;
    /*options.scaleX = next.width > 0 ? previous.width / next.width : 0;
    options.scaleY = next.height > 0 ? previous.height /next.height : 0;*/
    return new TransformAnimation(element, options);
  }
 
  firstFrame() {  
    let transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scaleX}, ${this.scaleY})`;
    
    if(this.baseTransform && 'none' !== this.baseTransform)
      transform += ' ' + this.baseTransform

    this.target.style.transform = transform;
  }
  
  secondFrame() {
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
  }
  
  firstFrame() {
    this.target.style.opacity = '0';
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
class FadeOutAnimation extends ElementAnimation {
  constructor(element) {
    super(element)
  }
  
  get animationType() {
    return AnimationType.Transition
  }
  
  firstFrame() {
    this.target.style.top = this.previousState.top  + 'px';
    this.target.style.left = this.previousState.left + 'px';
    this.target.style.position = 'relative';
  }
  
  secondFrame() {
    this.target.classList.add('animate--opacity');
    this.target.style.opacity = '0';
  }
  
  afterComplete() {
    this.target.classList.remove('animate--opacity');
    super.afterComplete();
  }
}
