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

        // Set request stuff to blank for now, will be filled later
        this.icon = '';
        this.title = '';

        // Set current date
        var date = new Date();
        this.date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();

        // Separate requests for icon and title because the title will generally arrive much
        // faster than the icon
        var iconRequest = new Request({
            url: './inc/linkRequest.php',
            method: 'get',
            noCache: true,
            onSuccess: function ( responseText ) {
                var linkData = JSON.decode( responseText );

                if ( typeOf( linkData.icon ) != undefined )
                    that.element.getElement('.shortcut-icon img').set('src', linkData.icon);
            }
        }).send( "url=" + encodeURIComponent( this.url ) + "&getIcon=true" );

        var titleRequest = new Request({
            url: './inc/linkRequest.php',
            method: 'get',
            noCache: true,
            onSuccess: function ( responseText ) {
                var linkData = JSON.decode( responseText );

                // Set this to set('text') to break on purpose to test error checking
                if ( typeOf( linkData.title ) != undefined )
                    that.element.getElement('.title-text').set('html', linkData.title);
            },
            onLoadstart: function () {
                //that.element.getElement('.title-text').set('text', "Loading...");
            }
        }).send( "url=" + encodeURIComponent( this.url ) + "&getTitle=true" );

        this.createLink();
    },

    // Builds link from supplied info.  Assumes link info is set (not a new link)
    // If it is a new link, processLink should be called first.
    buildLink : function () {
        var that = this;

        this.element = new Element( 'div.link').grab( new Element('div.link-container-div').grab(
            new Element( 'table.link-container', {
                cellpadding: 0,
                cellspacing: 0
            }).
                grab(
                    new Element( 'tr' ))
                ));

        // Add icon element with default icon, will be updated with real icon by request
        // if it exists later
        this.element.getElement('tr').grab( new Element( 'td.icon' ).grab(
            new Element( 'div.shortcut-icon', {
                'html': "<img src='" + this.icon + "' border='0' />"
            })
        ));

        // First put link date
        this.element.getElement( 'tr' ).grab( new Element( 'td.link-date').
            grab( new Element( 'div.date-text', {
                html: this.date
            }))
        );

        // Then put link title
        this.element.getElement( 'tr' ).grab( new Element( 'td.link-title').
            grab( new Element( 'a', {
                target: "_blank",
                href: this.url
            }).
                grab( new Element( 'div', {
                    class: "title-text tooltip",
                    html: this.title == '' ? 'Loading...' : this.title,
                    title: this.url
                }))
        ));

        // Put full url at bottom.  For now. >=(
        // NOT ANYMORE
        /*this.element.getElement( 'tr' ).grab(
            new Element( 'td.full-url').grab(
                new Element( 'div.url-text', {
                    html: this.url
                }
            )
        ));*/

        // Add link menu after table
        /*this.element.getElement('.link-container-div').grab( new Element( 'div.link-menu', {
            'html': '<div class="link-close-button"></div>'
        }));*/

        // Add link menu and buttons
        this.element.getElement('tr').grab( new Element( 'td').
            grab( new Element( 'div.link-menu').
            grab( new Element( 'div.link-edit-button' )).
            grab( new Element( 'div.link-close-button' ))));

        // Add full url rollout

        // Add hidden url field for referencing
        this.element.grab( new Element( 'input.full-url', {
            type: "hidden",
            value: this.url
        }));
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

            // Show full url in status bar - replace if already exists
            var url = el.getElement('.full-url').get('value');
            $('menu').getElements('.full-url-menu').dispose();

            $('full-url-container').grab( new Element( 'div.full-url-menu',{
                html: url + '<a href="' + url + '" target="_blank">' + '<div class="go"></div>' + '</a>'
            }));

            // Clear periodical
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
			droppables: '.chain .chain-link-container',

            stopPropagation: true, // Make sure child drag doesn't trigger parent (chain) drag
			
			onStart: function (el, e) {
				// Set parent z-index higher than all others so link is always above other containers
                if ( el.getParent( '.chain-zone' ) )
				    el.getParent( '.chain-zone' ).setStyle( 'z-index', 2 );

                if ( el.getParent('.chain') )
                    el.getParent('.chain').setStyle( 'z-index', 2 );

                // Update droppable list as it might have/probably changed
                this.droppables = $$('.chain .chain-link-container');
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
					droppable.grab( el, 'top' );

                    // Reset positioning, otherwise moo will attempt to position it from where it was last
                    el.setStyles({
                        left: 0,
                        top: 0
                    });

                    // Update bookmarks in database
                    Shell.update();
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

        /*// Tooltips
        var linkTip = new Tips('.link .title-text', {
            showDelay: 600,
            fixed: true,
            offset: { x: 50, y: 50 }
        });*/
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
            width: 33
        });
    },
	
	getLink: function () {
		if ( typeof( this.newLink ) != 'undefined' )
			return this.newLink;
	}
});