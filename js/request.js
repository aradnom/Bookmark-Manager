/**
 * @author Tim Shaw
 * @date 5/29/12
 * @time 4:39 PM
 * @description Handles saving and loading of bookmark chains. Can be called to take a snapshot
 * of the current chain setup on events.
 */

window.addEvent( 'domready', function() {

    // Store current bookmark setup
    storeBookmarks = function () {
        var storeRequest = new Request({
            url: 'inc/request.php',
            onSuccess: function ( response ) {
                $('status').set('html', response);
            }
        });

        var bookmarks = {
            shells: []
        }

        $$('.chain-zone-new, .chain-zone').each( function( zone, zoneIndex ) {
            bookmarks.shells.push({
                "id": zone.get('id'),
                "chains": []
            });

            zone.getElements('.chain').each( function( chain, chainIndex ) {
                bookmarks.shells[zoneIndex].chains.push({
                    "title": chain.getElement('.chain-title').get('html'),
                    "links": []
                });

                chain.getElements('.link').each( function( link, linkIndex ) {
                    bookmarks.shells[zoneIndex].chains[chainIndex].links.push({
                        "title": link.getElement('.link-title').get('html'),
                        "url": link.getElement('.full-url').get('html')
                    });
                });
            });
        });

        console.log( bookmarks );

        storeRequest.send( "bookmarks=" + JSON.stringify(bookmarks) );
    }

    // Retrieve bookmark snapshot, assumed to be most recent snapshot.  Level can be 0 (newest)
    // to the oldest stored snapshot (5 by default).  If a higher level than exists is sent will
    // return oldest available level.
    loadUserBookmarks = function ( user, level ) {
        level = level || 0;

        var retrieveRequest = new Request({
            url: 'inc/request.php',
            onSuccess: function ( response ) {
                console.log( JSON.decode( response ) );

                // Build bookmarks

            }
        });

        // Send request for most snapshot to db
        retrieveRequest.send( "user=" + "tim" + "&level=" + level );
    }

});