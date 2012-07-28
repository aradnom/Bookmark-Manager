/**
 * @author Tim Shaw
 * @date 6/14/12
 * @time 11:43 PM
 */

var Functions = {}

Functions.hide = function ( el, duration ) {
    el.set( 'morph', {
        duration: duration,
        transition: 'sine:out'
    });

    el.morph({
        opacity: 0
    });

    (function () {
        el.setStyle( 'display', 'none' );
    }).delay( duration );
}

Functions.show = function ( el, duration, display ) {
    el.setStyle( 'display', display );

    el.set( 'morph', {
        duration: duration,
        transition: 'sine:out'
    });

    el.morph({
        opacity: 1
    });
}
