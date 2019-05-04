var DeltaAnimation = {}

/**
 * @param {function} change
 * @param {function} animation
 */
DeltaAnimation.animateChange = function(change, animation) {
    Coordinator.scheduleChange({change, animation});
}

DeltaAnimation.options = {
    duration: '1s',
}