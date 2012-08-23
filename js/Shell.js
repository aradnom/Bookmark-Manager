// The shell class contains a set of link containers which contain links.  It's responsible
// for managing everything.

var Shell = new Class ({
	Implements : [Options, Events],
	
	options : {
		maxChains: 20,
        snapshotLimit: 10
	},
	
	initialize : function ( element, user, options ) {
		this.setOptions( options );
		this.element = $(element); // Reference to shell element - not a new Element
        this.user = user;
				
		// Build shell for output		
		this.setup();

        // Add shell event delegation
        this.addEvents();

        // Assume we're starting at newest snapshot
        this.undoLevel = 0;
		
		return this;
	},

    // Initial chain creation, includes a new container and two default containers
    setup : function () {
        if ( this.user ) {
            // If user is set, load user bookmarks
            this.loadUserBookmarks();
        } else {
            // Otherwise, load a default layout
            this.defaultSetup();
        }
    },

    defaultSetup : function () {
        // Special zone for new links, doesn't contain a permanent chain as it's a working
        // area for new links or links from deleted containers, that sort of thing.  Can't be
        // deleted.
        var newZone = this.addZone();
        this.element.grab( newZone );
        this.addDivider();

        // Add a couple other zones and chains just to get things started.  Pants.
        var zone1 = this.addZone();
        zone1.getElement( '.chain-container' ).grab( this.addChain( "New Links" ) );
        this.element.grab( zone1 );
        this.addDivider();

        var zone2 = this.addZone();
        zone2.getElement( '.chain-container' ).grab( this.addChain( "PANTS" ) );
        this.element.grab( zone2 );
        this.addDivider();

        // Make sure add new container button stays at the very end
        this.element.grab( this.element.getElement( '#add-new-chain-button-container' ) );
    },

    addEvents : function () {
        var that = this;

        // Event delegation, handled from shell because dynamic elements need to be bound

        // Add chain to specific zone
        this.element.addEvent( 'click:relay(div.zone-add-chain-button)', function ( event, el ) {
            var newChain = new Chain( 'New Chain' );

            el.getParent( '.zone-header').getNext('.chain-container').grab( newChain.getElement() );
            Shell.update();
        });

        // Zone left
        this.element.addEvent( 'click:relay(div.zone-left-button)', function ( event, el ) {
            that.moveZoneLeft( el );
            Shell.update();
        });

        // Zone right
        this.element.addEvent( 'click:relay(div.zone-right-button)', function ( event, el ) {
            that.moveZoneRight( el );
            Shell.update();
        });

        // Remove zones
        this.element.addEvent( 'click:relay(div.zone-close-button)', function ( event, el ) {
            that.removeZone( $(el.getParent('td')) );

            Shell.update();
        });

        // Zone title rename
        this.element.addEvent( 'dblclick:relay(div.zone-title)', function ( event, el ) {
            that.renameElement( el );
        });

        // Remove chains
        this.element.addEvent( 'click:relay(div.chain-close-button)', function ( event, el ) {
            that.removeChain( $(el.getParent('.chain')) );

            Shell.update();
        });

        // Chain up
        this.element.addEvent( 'click:relay(div.chain-up-button)', function ( event, el ) {
            Chain.moveChainUp( el );
        });

        // Chain down
        this.element.addEvent( 'click:relay(div.chain-down-button)', function ( event, el ) {
            Chain.moveChainDown( el );
        });

        // Chain title rename
        this.element.addEvent( 'dblclick:relay(div.title-text)', function ( event, el ) {
            that.renameElement( el );
        });

        // Link title rename
        this.element.addEvent( 'click:relay(.link-edit-button)', function ( event, el ) {
            that.renameElement( el.getParent('td').getPrevious('.link-title').getElement('.title-text') );
        });

        // Remove link
        this.element.addEvent( 'click:relay(.link-close-button)', function ( event, el ) {
            el.getParent('.link').dispose();
            Shell.update();
        });
    },

    renameElement : function ( el ) {
        // Input element for new title
        var newTitleInput = new Element( 'input#new-title', {
            type: "text",
            value: el.get('text'),
            events: {
                blur: function () {
                    el.set( 'html', this.get( 'value' ) );
                    Shell.update();
                }
            }
        });

        // Erase element
        el.set('html', '');

        // Then attach input
        el.grab( newTitleInput );

        // Set focus to input
        newTitleInput.focus();

        // Set up keyboard crap
        var saveTitle = function () {
            el.set( 'text', newTitleInput.get("value") );
            Shell.update();
            keyboardHook.deactivate();
        }

        var keyboardHook = new Keyboard();

        keyboardHook.addEvents({
            'enter': saveTitle
        }).activate();
    },

    addZone : function ( title ) {
        var newZoneContainer = new Element( 'td.zone' );
        var newZone = new Element( 'div#' + ( $$('td.zone').length == 0 ? 'zone-new' : $$('td.zone').length ) );

        // Set up new link zone (different behavior from normal zone)
        newZone.addClass( $$('td.zone').length == 0 ? "chain-zone-new add-new-link-button button" : "chain-zone" );

        // Grab zone to container based on id
        newZoneContainer.grab( newZone );

        // Zone header and title element
        var zoneHeader = new Element( 'div.zone-header').grab(
            new Element( 'div.header-corner' )
        ).grab( new Element( 'div.zone-title', {
            html: title
        }));
        newZone.grab( zoneHeader );

        // Zone menu
        zoneHeader.grab( new Element( 'div.zone-menu' ).
            grab( new Element( 'div', {
                class: 'zone-add-chain-button button'
            })).
            grab( new Element( 'div', {
                class: 'zone-left-button button'
            })).
            grab( new Element( 'div', {
                class: 'zone-right-button button'
            })).
            grab( new Element( 'div', {
                class: 'zone-close-button button'
            }))
        );

        // Zone chain container
        var chainContainer = new Element( 'div.chain-container' );
        newZone.grab( chainContainer );

        // Zone drop element and icon
        newZone.grab(
            new Element( 'div.zone-drop').grab(
                new Element( 'div.drop-icon'
                )).grab(
                new Element( 'div.drop-corner' )
            ));

        // Zone hover effects
        this.addZoneEffects( newZone );

        return newZoneContainer;
    },
	
	// Grabs chain to shell element.  Will be added with new zone by default which can just be
	// deleted by merging with another zone
	addChain : function ( title ) {
		if ( title ) {
			var that = this;

            // Create chain itself
			var newChain = new Chain( title, null, {
                id: 'chain-' + this.element.getElements('.chain').length
            });

            return newChain.getElement();
		}
	},

    // Adds divider between zones
    addDivider : function () {
        // Zone border
        this.element.grab( new Element( 'td', {
            'class': 'zone-divider'
        }).grab( new Element( 'div' )));
    },

    // Adds zone, chain and divider and grabs to element as a single unit using the above functions
    addUnit : function () {
        var newZone = this.addZone( "New Zone" );
        newZone.getElement('.chain-container').grab( this.addChain( "New Chain" ) );
        this.element.grab( newZone);
        this.addDivider();

        // Make sure add new container button stays at the very end
        this.element.grab( this.element.getElement( '#add-new-chain-button-container' ) );
    },
	
	removeChain : function ( chain ) {
		if ( chain ) {
			// Get parent zone before deleting so it can still be accessed
			var parent = chain.getParent( 'td' );
			
			// First remove chain
			chain.dispose();	
			
			// Then remove zone if it's empty
			if ( parent.getElements('.chain').length == 0 ) {
				// Remove divider before parent, should always be previous element
				parent.getPrevious().dispose();
				parent.dispose();				
			}
		}
	},

    // Will merge links of two containers, preferring title of container that is dropped on to
	mergeChains : function ( first, second ) {
		
	},

    removeZone : function ( zone ) {
        if ( zone ) {
            // First remove divider
            zone.getPrevious().dispose();

            // Then remove zone itself
            zone.dispose();
        }
    },

    moveZoneLeft : function ( el ) {
        var parent = el.getParent('.zone');

        if ( !parent.getPrevious('.zone').getElement('#zone-new') ) {
            var previous = parent.getPrevious('.zone');
            var temp = previous.getElement('.chain-zone');

            previous.grab( parent.getElement('.chain-zone') );
            parent.grab( temp );
        }
    },

    moveZoneRight : function ( el ) {
        var parent = el.getParent('.zone');

        if ( parent.getNext('.zone') ) {
            var next = parent.getNext('.zone');
            var temp = next.getElement('.chain-zone');

            next.grab( parent.getElement('.chain-zone') );
            parent.grab( temp );
        }
    },

    addZoneEffects : function ( zone ) {
        // Standalone morph because el.morph doesn't play well with others
        var headerHover = new Fx.Morph( zone.getElement( '.zone-header' ), {
            duration: 100,
            transition: 'sine:out',
            link: 'cancel'
        });

        var dropHover = new Fx.Morph( zone.getElement( '.zone-drop' ), {
            duration: 100,
            transition: 'sine:out',
            link: 'cancel'
        });

        // Container hover events
        zone.addEvents({
            mouseover: function () {
                headerHover.start({
                    borderTopRightRadius: 3,
                    borderTopLeftRadius: 3
                });
                dropHover.start({
                    borderBottomRightRadius: 3,
                    borderBottomLeftRadius: 3
                });
            },

            mouseout: function () {
                headerHover.start({
                    borderTopRightRadius: 10,
                    borderTopLeftRadius: 10
                });
                dropHover.start({
                    borderBottomRightRadius: 10,
                    borderBottomLeftRadius: 10
                });
            }
        });
    },

    loadUserBookmarks : function ( level ) {
        level = level || 0;
        var that = this;

        var retrieveRequest = new Request({
            url: 'inc/request.php',
            onSuccess: function ( response ) {
                var decoded = JSON.decode( response );

                // Build bookmarks if nothing exploded
                if ( decoded.error )
                    Shell.setError( decoded.error );
                else
                    that.buildUserShell( decoded );

                // Create summary for footer element
                Shell.buildSummary();
            }
        });

        // Send request for most snapshot to db
        retrieveRequest.send( "user=" + "tim" + "&level=" + level );
    },

    undo : function () {
        if ( this.undoLevel < this.options.snapshotLimit ) {
            this.undoLevel++;
            this.loadUserBookmarks( this.undoLevel );
        }
    },

    redo : function () {
        if ( this.undoLevel > 0 ) {
            this.undoLevel--;
            this.loadUserBookmarks( this.undoLevel );
        }
    },

    // Expects a JSON object from db
    buildUserShell : function ( bookmarks ) {
        var that = this;

        // Make sure shell is empty before building (for undo purposes)
        this.element.getElements( 'td.zone, td.zone-divider' ).each( function ( el ) {
            el.dispose();
        });

        bookmarks.shells.each( function ( zone ) {
            // Add new zone
            var newZone = that.addZone( zone.title );
            that.element.grab( newZone );
            that.addDivider();

            // Add chains to zone
            zone.chains.each( function ( chain ) {
                var newChain = new Chain( chain.title, null, {
                    id: 'chain-' + that.element.getElements('.chain').length
                });

                newZone.getElement('.chain-container').grab( newChain.getElement() );

                // Remove empty link element if links exist
                if ( chain.links.length > 0 )
                    newChain.getElement().getElement( '.chain-empty').dispose();

                // Add links to chain
                chain.links.each( function ( link ) {
                    var newLink = new Link( newChain.getElement().getElement('.chain-link-container'), link.url, {
                        title : link.title,
                        icon: link.icon,
                        date: link.date
                    }, null );
                });
            });
        });

        // Make sure add new container button stays at the very end
        that.element.grab( that.element.getElement('#add-new-chain-button-container') );
    },
	
	// Getters/setters
	
	getShell : function () {
		if ( typeof( this.element ) != 'undefined' )
			return this.element;
	}
});

// Static functions

Shell.storeUserBookmarks = function () {
    var storeRequest = new Request({
        url: 'inc/request.php',
        onSuccess: function ( response ) {
            if ( response ) {
                var decoded = JSON.decode( response );

                if ( decoded.error )
                    Shell.setError( decoded.error );
            }
        }
    });

    var bookmarks = {
        shells: []
    }

    $$('.chain-zone-new, .chain-zone').each( function( zone, zoneIndex ) {
        bookmarks.shells.push({
            "id": zone.get('id'),
            "title": zone.getElement('.zone-title').get('html'),
            "chains": []
        });

        zone.getElements('.chain').each( function( chain, chainIndex ) {
            bookmarks.shells[zoneIndex].chains.push({
                "title": chain.getElement('.title-text').get('html'),
                "links": []
            });

            chain.getElements('.link').each( function( link, linkIndex ) {
                bookmarks.shells[zoneIndex].chains[chainIndex].links.push({
                    "title" : encodeURIComponent( link.getElement('.title-text').get( 'html' ) ),
                    "url" : encodeURIComponent( link.getElement('.full-url').get('value') ), // Hidden field because hidden field is hidden
                    "icon" : link.getElement( '.shortcut-icon img' ).get( 'src' ),
                    "date" : link.getElement( '.date-text' ).get( 'html' )
                });
            });
        });
    });

    //console.log( JSON.encode(bookmarks) );

    storeRequest.send( "bookmarks=" + JSON.encode(bookmarks) );
}

// Returns nested list of bookmarks in div elements.  Level can be 1-3.
// 1 = shells
// 2 = chains
// 3 = links
// Will return everything in that level and above (zones and chains by default)
Shell.listBookmarks = function ( level ) {
    level = level || 2;

    // Create top-level element if there's something to contain
    if ( level >= 1 ) {
        var bookmarks = new Element( 'div.bookmark-summary' );

        $$('.chain-zone').each( function( zone ) {
            // Create parent zone element
            var zoneSummary = new Element( 'div.zone-summary' ).
                grab( new Element( 'div.zone-title-summary', {
                    html: zone.getElement('.zone-title').get('text'),
                    alt: zone.get('id')
                }));

            bookmarks.grab( zoneSummary );

            if ( level >= 2 ) {
                zone.getElements('.chain').each( function( chain ) {
                    // Grab chains to shell element
                    var chainSummary = new Element( 'div.chain-summary' ).
                        grab( new Element( 'div.chain-title-summary', {
                            html: chain.getElement('.title-text').get('text')
                        }));

                    zoneSummary.grab( chainSummary );

                    if ( level >= 3 ) {
                        chain.getElements('.link').each( function( link ) {
                            // Grab links to chain element
                            chainSummary.grab( new Element( 'div.link-summary' ).
                                grab( new Element( 'div.link-title-summary', {
                                    html: link.getElement('.title-text').get('text')
                                }))
                            );
                        });
                    }
                });
            }
        });

        return bookmarks;
    } else
        return false;
}

// Get summary of bmarks and set in footer
Shell.buildSummary = function () {
    // Delete element before creating if it exists
    if ( $$('#footer .bookmark-summary') )
        $$('#footer .bookmark-summary').each( function ( el ) {
            el.dispose();
        });

    this.summary = Shell.listBookmarks();
    $('footer-summary').grab( this.summary );
}

// Saves current bookmark snapshot and updates summary
Shell.update = function () {
    Shell.storeUserBookmarks();
    Shell.buildSummary();
}

// Searches shell elements
// Depth determines search depth
// Returns array of result elements
// 1 = shells
// 2 = chains
// 3 = links
// Default depth is 3 (links)
Shell.search = function ( query, level ) {
    level = level || 3;
    var results = {
        zones: [],
        chains: [],
        links: []
    };

    // Search zones
    if ( level >= 1 ) {
        $$('.zone-title').each( function (el) {
            if ( ~el.get('text').toLowerCase().indexOf( query.toLowerCase() ) )
                results.zones.push( el.getParent('.chain-zone') );
        });

        // Search chains
        if ( level >= 2 ) {
            $$('.chain-title .title-text').each( function (el) {
                if ( ~el.get('text').toLowerCase().indexOf( query.toLowerCase() ) )
                    results.chains.push( el.getParent('.chain') );
            });

            // Search links
            if ( level >= 3 ) {
                $$('.link-title .title-text').each( function (el) {
                    if ( ~el.get('text').toLowerCase().indexOf( query.toLowerCase() ) )
                        results.links.push( el.getParent('.link') );
                });
            }
        }

        // Return results if level >= 1
        return results;
    }

    // Otherwise just false
    return false;
}

// Sets error code in appropriate place, expects a string
Shell.setError = function ( message ) {
    $('menu').grab( new Element( 'div.error', {
        html: message
    }));
}