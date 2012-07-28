// Link class

var Link = new Class ({
	Implements : [Options, Events],
	
	options : {
        defaultIcon: "defaulticon.ico"
	},
	
	initialize : function ( container, url, linkData, options ) {
		if ( url === '' ) // Don't bother if no url was sent
			return false;
		
		this.setOptions( options );
        this.container = $(container);
        this.url = url;

        // Process link info if it's new, otherwise build element from data and kick it out the door
        if ( linkData ) {
            // Set vars from link data
            this.title = linkData.title;
            this.icon = linkData.icon;
            this.date = linkData.date;

            this.createLink();
        } else
		    this.processLink();
	},

    processLink : function () {
        var that = this;

        this.url.replace( "http://", "").replace( "www.", "" );

        var pageRequest = new Request({
            url: './inc/linkRequest.php',
            method: 'get',
            noCache: true,
            onSuccess: function ( responseText ) {
                var linkData = JSON.decode( responseText );

                if ( typeOf( linkData.icon ) != undefined )
                    //that.element.getElement( '.shortcut-icon img' ).set( 'src', linkElements.icon );
                    that.icon = linkData.icon;

                if ( typeOf( linkData.title ) != undefined )
                    //that.element.getElement( '.shortcut-icon img' ).set( 'src', linkElements.icon );
                    that.title = linkData.title;

                if ( typeOf( linkData.date ) != undefined )
                //that.element.getElement( '.shortcut-icon img' ).set( 'src', linkElements.icon );
                    var date = new Date( linkData.date * 1000 );
                    that.date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();

                that.createLink();

                // Remember to remove loading element
                that.container.getElement('.link-loading').dispose();
            },
            onFailure: function ( xhr ) {
                //console.log( xhr.status );
            },
            onLoadstart: function ( event, xhr ) {
                that.container.grab( new Element( 'div.link-loading', {
                    html : "Loading link..."
                }));
            }
        }).send( "url=" + this.url );
    },

    // Builds link from supplied info.  Assumes link info is set (not a new link)
    // If it is a new link, processLink should be called first.
    buildLink : function () {
        var that = this;

        this.element = new Element( 'div.link').grab( new Element('div.link-container-div').grab(
            new Element( 'table.link-container').grab(
                new Element( 'tr' ))));

        // Add icon element with default icon, will be updated with real icon by request
        // if it exists later
        this.element.getElement('tr').grab( new Element( 'td.icon' ).grab(
            new Element( 'div.shortcut-icon', {
                'html': "<img src='" + this.icon + "' border='0' />"
            })
        ));

        // First put link title
        this.element.getElement( 'tr' ).grab( new Element( 'td.link-title', {
            'html': this.title
        }));

        // Then link add date
        this.element.getElement( 'tr' ).grab( new Element( 'td.link-date', {
            'html': this.date
        }));

        // Put full url at bottom.  For now. >=(
        this.element.getElement( 'tr' ).grab(
            new Element( 'td.full-url').grab(
                new Element( 'div.url-text', {
                    html: this.url
                }
            )
        ));

        // Add link menu after table
        this.element.grab( new Element( 'div.link-menu', {
            'html': '<div class="link-close-button"></div>'
        }));

        // Bind link dispose
        this.element.getElement('.link-close-button').addEvent( 'click', function () {
            that.element.dispose();
        });
    },

    // Builds link, adds effects and grabs to container element once link data is defined
    createLink : function () {
        this.buildLink();
        this.addEffects( this.element );
        this.container.grab( this.element );
    },
	
	// Binds hover effects to link
	addEffects : function ( el ) {
		var that = this;
        var rolloutTimer;

        var linkMenuRollout = function ( el ) {
            that.showLinkMenu();
            clearInterval( rolloutTimer );
        }

        // Standalone morph because el.morph doesn't play well with others
        var linkHover = new Fx.Morph( el, {
            duration: 100,
            transition: 'sine:out',
            link: 'cancel'
        });
		
		// Hover events
		el.addEvents({
			mouseover: function () {
                linkHover.start({
                    borderRadius: 3,
                    '-moz-border-radius': 3
                });

                rolloutTimer = linkMenuRollout.periodical( 500, this, el );
			},
			
			mouseout: function () {
                linkHover.start({
                    borderRadius: 5,
                    '-moz-border-radius': 5
                });

                clearInterval( rolloutTimer );
			}
		});
		
		// Drag event

		var linkDrag = new Drag.Move( el, {
			droppables: '.chain',

            stopPropagation: true, // Make sure child drag doesn't trigger parent (chain) drag
			
			onStart: function (el, e) {
				// Set parent z-index higher than all others so link is always above other containers
                if ( el.getParent( '.chain-zone' ) )
				    el.getParent( '.chain-zone' ).setStyle( 'z-index', 2 );

                if ( el.getParent('.chain') )
                    el.getParent('.chain').setStyle( 'z-index', 2 );

                // Update droppable list as it might have/probably changed
                this.droppables = $$('.chain');
			},
			
			onDrop: function ( el, droppable, event ) {
				// If droppable exists, make new drop element
				if ( droppable && droppable != el.getParent( '.chain' ) ) {
					// Reset parent element to default z-index before making new element
                    if ( el.getParent( '.chain-zone' ) )
					    el.getParent( '.chain-zone' ).setStyle( 'z-index', 1 );

                    if ( el.getParent('.chain') )
                        el.getParent('.chain').setStyle( 'z-index', 1 );

                    // Remove empty element if it exists
                    if ( droppable.getElement('.chain-empty') )
                        droppable.getElement('.chain-empty').dispose();

                    // Set up empty element in parent if no other links exist in it
                    if ( el.getParent('.chain') )
                        if( el.getParent('.chain').getElements('.link').length == 1 &&
                            !el.getParent('.chain').getElement('.chain-empty') ) // 1 because of this element
                            el.getParent('.chain').grab( new Element( 'div.chain-empty', { html: 'Add links here' } ) )
					
					// Attach new element to droppable and delete old element
					droppable.grab( el );

                    // Reset positioning, otherwise moo will attempt to position it from where it was last
                    el.setStyles({
                        left: 0,
                        top: 0
                    });

                    // Update bookmarks in database
                    Shell.storeUserBookmarks();
				} else {
					// Otherwise just snap back to origin
					el.set( 'morph', {
						duration: 500,
						transition: 'elastic:out',
                        link: 'cancel'
					});
					
					el.morph({
						top: 0,
						left: 0
					});
				}
			},
		 
			onEnter: function ( element, droppable ) {
				//To be used later
			},
		 
			onLeave: function ( element, droppable ) {
				//same as above
			}
		});
	},

    hideLinkMenu : function () {
        // Placed in index delegation, works very strangely if placed here
    },

    showLinkMenu : function () {
        var linkMenu = this.element.getElement('.link-menu');

        linkMenu.set('morph', {
            duration: 100,
            transition: 'sine:out'
        });

        linkMenu.morph({
            width: 18,
            right: -16
        });
    },
	
	getLink: function () {
		if ( typeof( this.newLink ) != 'undefined' )
			return this.newLink;
	}
});