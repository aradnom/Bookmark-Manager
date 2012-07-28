/**
 * @author: Tim Shaw
 * @date: 6/23/12
 * @time: 2:36 AM
 * @desc Mootools scripting for floating menu element
 */

window.addEvent( 'domready', function () {
    // Window scroll listening event to update menu position
    var container = $(window);
    var menu = $('menu');

    container.addEvent( 'scroll', function () {
        var scroll = container.getScrollLeft();

        menu.setStyles({
            left: scroll
        });
    });

    // Other tidbits

    $('link').addEvent( 'click', function () {
        $('link').set( 'value', '' );
    });
});
