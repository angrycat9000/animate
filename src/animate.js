/**
* @class AnimationBase
* @param {HTMLElement} element container element to animate elements within
*/
function AnimationBase(element) {
  this.element = element;
  this.duration = '0.5s';
  this.timingFunction = 'linear';
}

/**
*
*/
AnimationBase.prototype.applyAnimation = function(element, name, direction) {
  element = element || this.element;
  direction = direction || 'forwards';
  
  let duration = this.duration;
  if('number' === typeof duration)
    duration = duration + 's';
  
  element.style.animationName = name;
  element.style.animationDirection = direction;
  element.style.animationDuration = this.duration;
  element.style.animationTimingFunction = this.timingFunction;
  
  this.callback = this.onAnimationEnd.bind(this);
  element.addEventListener('animationend', this.callback);
}

/*
* 
*/
AnimationBase.prototype.animate = function() {
  
}

/*
*
*/
AnimationBase.prototype.onAnimationEnd = function(e) {
  if(e.target !== e.currentTarget)
    return;

  this.postAnimationCleanup(e.target);  
  
  e.target.style.animationName = '';
  e.target.style.animationDirection = '';
  e.target.style.animationDuration = '';
  e.target.style.animationTimingFunction = '';
  e.target.removeEventListener('animationend', this.callback)
}

/**
* Sub-classes should overide this to do additional clean up.  Base takes care of removing
* animation properties set from applyAnimation
*/
AnimationBase.prototype.postAnimationCleanup = function(element) {}

/**
*
*/
function TranslateAnimation(element) {
  AnimationBase.call(this, element);
  this.previous = new State(element);
}
TranslateAnimation.prototype = Object.create(AnimationBase.prototype);
TranslateAnimation.prototype.construtor = TranslateAnimation;

/**
*
*/
TranslateAnimation.prototype.animate = function() {
  this.current = new State(this.element, ['transform']);
  let dy = this.previous.top - this.current.top;
  let dx = this.previous.left - this.current.left;
  
  this.element.style.transform = 'translate(' + dx + 'px , ' + dy + 'px  )'; 
  this.applyAnimation(null, 'animate-transform');
}

/*
*
*/
TranslateAnimation.prototype.postAnimationCleanup = function(element) {
  this.current.restoreInlineCSS(element);
}

/**
* Animation that stretches elements as they appear and compresses them 
* as they are removed from a container.
* @param {HTMLElement} element - container element.
* @param {string} [direction] - 'horizontal' or 'vertical'
*/
function StretchAnimation(element, direction) {
  AnimationBase.call(this, element);
  this.direction = 'vertical';
  if(direction === 'horizontal')
    this.direction = direction;
  this.animationName = 'stretch-' + this.direction;
  this.previousState = this.buildStateArray();
}
StretchAnimation.prototype = Object.create(AnimationBase.prototype);
StretchAnimation.prototype.constructor = StretchAnimation;

/*
*
*/
StretchAnimation.prototype.buildStateArray = function(props) {
  var length = (this.element.children.length)
  var stateArray = new Array(length);
  
  var containerState = new State(this.element);
  
  var firstVisible = null, lastVisible = null;
  var adjacentVisible = null;
  
  Array.prototype.forEach.call(this.element.children, (child, i)=>{
    let current = stateArray[i] = new State(child, props);
    current.index = i;
    
    if('static' !== current.position && 'relative' !== current.position)
      return;
    
    current.previousVisible = adjacentVisible;
    if(current.isDisplayed()) {
      adjacentVisible = current;
      if(null == firstVisible)
        firstVisible = current;
      lastVisible = current;
    }
  });
  
  adjacentVisible = null;
  for(let i=length-1;  i >= 0;  i--) {
    stateArray[i].nextVisible = adjacentVisible;
    if(stateArray[i].isDisplayed())
      adjacentVisible = stateArray[i];
  }
  
  stateArray.forEach((state,i)=>{
    if(state.isDisplayed())
      return;
   
    var prevBottom, nextTop, prevRight, nextLeft;
    
    if(state.previousVisible) {
      prevBottom = state.previousVisible.top + state.previousVisible.height;
      prevRight = state.previousVisible.left + state.previousVisible.width;
    }
    /*else if(firstVisible) {
      prevBottom = firstVisible.top + firstVisible.height;
      prevRight = firstVisible.left + firstVisible.width;
    }*/
    else {
      prevBottom = containerState.top;
      prevRight = containerState.left;
    }
      
    if(state.nextVisible) {
      nextTop = state.nextVisible.top;
      nextLeft = state.nextVisible.left;
    }
    else if(lastVisible) {
      nextTop = lastVisible.top + lastVisible.height;
      nextLeft = lastVisible.left + lastVisible.width;
    }
    else {
      nextTop = containerState.top;
      nextLeft = containerState.left;
    }
    
    state.vanishingPoint = {
      top: (nextTop + prevBottom) / 2,
      left: (nextLeft + prevRight) / 2
    };

  });
  
  return stateArray;
}



/*
*
*/
StretchAnimation.prototype.animate = function() {
  var currentState = this.buildStateArray(['transform','top','left','marginTop','transformOrigin', 'position', 'display']);
  this.current = currentState;
  
  for(let i = 0; i < this.previousState.length; i++) {
    let current = currentState[i];
    
    if('static' !== current.position && 'relative' !== current.position)
      return;
    
    let previous = this.previousState[i];
    let child = this.element.children[i];
    
    if(! previous.hasChange(current))
      continue;
    
    if( previous.isDisplayed() && !current.isDisplayed())
      this.animateHide(child, previous, current);
    else if (!previous.isDisplayed() && current.isDisplayed())
      this.animateShow(child, previous, current);
    else
     this.animateMove(child, previous, current);
  }

}

/**
*
*/
StretchAnimation.prototype.getTransformOrigin = function(hidden, visible) {
  let topRelative  = hidden.vanishingPoint.top - visible.top + 'px';
  let leftRelative = hidden.vanishingPoint.left - visible.left +'px'; 
  if('vertical' === this.direction) 
    return 'center ' + topRelative;
  else if ('horizontal' === this.direction)
    return leftRelative + ' center';
   else
     return leftRelative + ' ' + topRelative;
}

/*
*
*/
StretchAnimation.prototype.animateShow = function (element, previous, current) {  
  element.style.transformOrigin = this.getTransformOrigin(previous, current);
  this.applyAnimation(element, this.animationName);
}

/*
*
*/
StretchAnimation.prototype.animateHide = function(element, previous, current) {
  element.style.display = previous.display;
  element.style.transformOrigin = this.getTransformOrigin(current, previous)
  element.style.position = 'absolute';
  element.style.top = previous.top + 'px';
  element.style.left = previous.left + 'px';
  element.style.marginTop = '0';
  this.applyAnimation(element, this.animationName,'reverse');
}

/*
*
*/
StretchAnimation.prototype.animateMove = function (element, previous, current) {
  let dy = previous.top - current.top;
  let dx = previous.left - current.left;
  element.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; 
  this.applyAnimation(element,'animate-transform');
}

/*
*
*/
StretchAnimation.prototype.postAnimationCleanup = function(element) {
  let i = Array.prototype.indexOf.call(this.element.children, element);
  
  this.current[i].restoreInlineCSS(element);
}

/*
*
*/
function FadeAnimation(element) {
  AnimationBase.call(this, element);
  this.previous = new State(element);
}
FadeAnimation.prototype = Object.create(AnimationBase.prototype);
FadeAnimation.prototype.constructor = FadeAnimation;

/*
*
*/
FadeAnimation.prototype.animate = function() {
  this.current = new State(this.element, ['display','position', 'top', 'left', 'marginTop']);
  
  if(this.previous.isDisplayed() === this.current.isDisplayed())
    return;
  
  if( ! this.previous.isDisplayed())
    this.applyAnimation(this.element, 'fade');
  else if(this.previous.isDisplayed()) {
    this.element.style.display = this.previous.display;
    this.element.style.position = 'absolute';
    this.element.style.top = this.previous.top + 'px';
    this.element.style.left = this.previous.left + 'px';
    this.element.style.marginTop = '0';
    this.applyAnimation(this.element,'fade', 'reverse');
  } else
}

FadeAnimation.prototype.postAnimationCleanup = function(element) {
  element.style.display = this.current.restoreInlineCSS(element);
}