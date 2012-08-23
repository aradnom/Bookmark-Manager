/**
 * @author: Tim Shaw
 * @date: 6/23/12
 * @time: 2:36 AM
 * @desc Mootools scripting for floating menu elements and other events outside the shell
 */

window.addEvent( 'domready', function () {
    // Window scroll listening event to update menu position
    var container = $(window);

    container.addEvent( 'scroll', function () {
        var scroll = container.getScrollLeft();

        // Scroll menu with bar
        $('menu').setStyles({
            left: scroll
        });

        // And also footer
        $('footer').setStyles({
            left: scroll
        });
    });

    $('footer').addEvent( 'click:relay(.zone-title-summary)', function ( event, el ) {
        var zoneEl = $('shell').getElement( "#" + el.get('alt'));
        /*var pos = zoneEl.getPosition().x;
        var finalPos = pos - ( ( $(window).getSize().x - zoneEl.getSize().x ) / 2 );

        var windowScroll = new Fx.Scroll( window, {
            duration: 600,
            wait: false
        }).start( finalPos, 0 );*/

        // Yeah, I totally did all the crap above before thinking "gee, I bet MT has a method for this already"
        // Sho' nuff...

        var windowScroll = new Fx.Scroll( window, {
            duration: 600,
            wait: false
        }).toElementCenter( zoneEl, 'x' );
    });

    // Other tidbits

    // Clear link input on either click
    // 'contextmenu' == right click
    $('link').addEvents({
        'contextmenu' : function () {
            $('link').set( 'value', '' );
        },

        'click' : function () {
            $('link').set( 'value', '' );
        }
    });

    // Menu link element events
    $('menu').addEvent( 'click:relay(.link-close-button)', function ( event, el ) {
        el.getParent('.link').dispose();
        Shell.update();
    });

    // Search input
    $('s').addEvents({
        'contextmenu' : function () {
            $('s').set( 'value', '' );
        },

        'click' : function () {
            $('s').set( 'value', '' );
        },

        'keyup' : function () {
            // Only process search if there's more than one character
            if ( $('s').get('value').length > 1 ) {
                // Clear previous results
                $('search-link-container').set( 'html', '' );
                var results = Shell.search( $('s').get('value') );

                results.links.each( function (el) {
                    $('search-link-container').grab( el.clone() );
                });

                // Scroll to bottom
                var scroller = new Fx.Scroll( window ).toBottom();
            }
        }
    });
});
