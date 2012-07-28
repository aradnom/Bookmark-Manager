// Container class for dropping links into

var Chain = new Class ({
	Implements : [Options, Events],
	
	options : {
		maxLinks: 20,
		linkHeight: 50,
		backgroundColor: '#0f0',
        id: 0
	},
	
	initialize : function ( title, links, options ) {
		this.setOptions( options );

		this.links = new Array();
		var that = this;

		/*if ( links )
			for ( var i = 0; i < links.length; i++ )
				this.links.push( links[i] );*/
				
		this.chain = new Element( 'div', {
			class: "chain droppable"
		});

        // Create title element
        var titleElement = new Element( 'div.chain-title' );

        titleElement.grab(new Element( 'div.title-text', {
            html: title
        }));

        titleElement.grab( new Element( 'div', {
            'class': 'chain-menu'
        }).
            grab( new Element( 'div', {
                'class': 'chain-up-button button'
            })).
            grab( new Element( 'div', {
                'class': 'chain-down-button button'
            })).
            grab( new Element( 'div', {
                'class': 'chain-close-button button'
            })));
		
		// Add title along with chain menu
		this.chain.grab( titleElement );

        // Link container
        this.chain.grab( new Element( '.chain-link-container' ) );
		
		// Add empty element if no links exist
		if ( !links || links.length == 0 )
			this.chain.getElement( '.chain-link-container' ).grab( new Element( 'div', {
				'class': 'chain-empty',
				html: "Add links here"
			}));

        // Add chain drag effects
        this.addEffects();

		return this;
	},
	
	addLink : function ( link ) {
		if ( typeof( this.links ) != 'undefined' && this.links.length < this.options.maxLinks ) {
			this.links.push( link );
			
			this.chain.setStyles({
				height: this.links.length * this.options.linkHeight
			});
		}
	},

    // Should be added only by the container because it needs to reference the parent element
    // Can be used with this or with passed element (static)
	addEffects : function ( chain ) {
		var el = chain == null ? this.chain : $(chain);
        var that = this;

        // Standalone morph because el.morph doesn't play well with others
        var chainHover = new Fx.Morph( el, {
            duration: 100,
            transition: 'sine:out',
            link: 'cancel'
        });
		
		// Drag event		
		var linkDrag = new Drag.Move( el, {
			droppables: '.chain-zone',
			
			onStart: function (el, e) {
				// Set parent z-index higher than all others so link is always above other containers
				el.getParent( '.chain-zone' ).setStyle( 'z-index', 2 );

                // Set chain index higher than others in chain zone
                el.setStyle( 'z-index', 2 );

                // Designate this chain as active - necessary so it's not attempting to process a drop
                // request on itself when merging chains (.chain)
                el.removeClass( 'droppable' );

                // Update droppable list as it might have changed
                this.droppables = $$('.chain-zone, .chain.droppable');
			},
			
			onDrop: function ( el, droppable, event ) {
				// If droppable exists, make new drop element
				if ( droppable ) {
                    // Merge chains
                    if ( droppable.hasClass('droppable') ) {
                        // Chains should be merged only if they have the same zone - that wau you can't accidentally
                        // merge two chains when moving zones.  Which I can see happening a lot.
                        if ( el.getParent() == droppable.getParent() ) {
                            // Move links over
                            el.getElements('.link').each( function (link) {
                                droppable.grab( link );
                            });

                            // Then destroy old container
                            el.dispose();

                            // Remove empty element from droppable if at least one link exists
                            if ( droppable.getElement('.link') && droppable.getElement( '.chain-empty' ) )
                                droppable.getElement( '.chain-empty' ).dispose();

                            // Persist changes to db
                            Shell.update();
                        } else
                            that.snapToOrigin( el );

                    // Otherwise just move to different zone
                    } else {
                        // Reset parent element to default z-index before making new element
                        el.getParent('.chain-zone').setStyle( 'z-index', 1 );

                        // Reset chain z-index
                        el.setStyle( 'z-index', 1 );

                        // Designate as droppable again
                        el.addClass( 'droppable' );

                        // Attach new element to droppable and delete old element
                        droppable.getElement( '.chain-container' ).grab( el, 'top' );

                        // Reset positioning, otherwise moo will attempt to position it from where it was last
                        el.setStyles({
                            left: 0,
                            top: 0
                        });

                        // Persist changes to db
                        Shell.update();
                    }

                    // Regardless, remove enter class
                    if ( el.getElement('.chain-title').hasClass('on-enter') )
                        el.getElement('.chain-title').removeClass('on-enter');
				} else
                    that.snapToOrigin( el );
			},
		 
			onEnter: function ( el, drop ) {
				el.getElement('.chain-title').addClass('on-enter');
			},
		 
			onLeave: function ( el, drop ) {
                if ( el.getElement('.chain-title').hasClass('on-enter') )
                    el.getElement('.chain-title').removeClass('on-enter');
			}
		});
	},

    snapToOrigin : function ( el ) {
        // Reset parent element to default z-index before making new element
        el.getParent('.chain-zone').setStyle( 'z-index', 1 );

        // Reset element z-index
        el.setStyle( 'z-index', 1 );

        // Otherwise just snap back to origin
        el.set( 'morph', {
            duration: 500,
            transition: 'elastic:out'
        });

        el.morph({
            top: 0,
            left: 0
        });
    },
	
	// Returns a reference to the created chain element (constructor will return ref to
    // object itself)
	getElement : function () {
		if ( typeof( this.chain ) != 'undefined' )
			return this.chain;
	}
});

// Static functions

Chain.moveChainUp = function ( el ) {
    var parent = el.getParent('.chain');

    if ( parent.getPrevious('.chain') ) {
        var previous = parent.getPrevious('.chain');
        previous.grab( parent, "before" );

        // Save the results
        Shell.update();
    }
}

Chain.moveChainDown = function ( el ) {
    var parent = el.getParent('.chain');

    if ( parent.getNext('.chain') ) {
        var next = parent.getNext('.chain');
        next.grab( parent, "after" );

        // Save the results
        Shell.update();
    }
}