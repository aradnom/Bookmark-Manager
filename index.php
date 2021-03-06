<?php
require_once( 'inc/defines_and_functions.php' );

if ( isset( $_POST['undo-level'] ) ) {
    echo $_POST['undo-level'];
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Le Bookmarks</title>
<script type="text/javascript" src="js/mootools-core-1.4.5-full-nocompat.js"></script>
<script type="text/javascript" src="js/mootools-more-1.4.0.1.js"></script>
<script type="text/javascript" src="js/Functions.js"></script>
<script type="text/javascript" src="js/Link.js"></script>
<script type="text/javascript" src="js/Chain.js"></script>
<script type="text/javascript" src="js/Shell.js"></script>
<script type="text/javascript" src="js/menus.js"></script>
<script type="text/javascript">
window.addEvent( 'domready', function () {
    // Setup.  Will attempt to load user bookmarks, otherwise will just present default setup
    // which can be saved in-session.

    // Some sort of user check to be added later
    if ( true ) {
        // Attempt to retrieve user bookmarks
        var shell = new Shell( 'shell', 'tim', {

        });
    } else {
        var shell = new Shell( 'shell', null, {

        });
    }

    // Button delegations, needed because elements are dynamically loaded in

    // Add new link window display

    $(window).addEvent( 'click:relay(div.add-new-link-button)', function ( event, el ) {
        // Set link element to appropriate offset for scroll
        $('add-new-link-container').setStyles({
            left: $(window).getScrollLeft()
        });

        showAddLink();
    });

    // Add new chain/zone

    $(window).addEvent( 'click:relay(.add-new-chain-button)', function ( event, el ) {
        shell.addUnit();

        var windowScroll = new Fx.Scroll( window, {
            duration: 600,
            wait: false
        }).toRight();

        Shell.update();
    });

    // Link menu hide, behaves strangely if placed in link object.  VERY strangely.  0_o

    $(window).addEvent( 'mouseleave:relay(div.link)', function ( event, el ) {
        var linkMenu = el.getElement('.link-menu');

        linkMenu.set('morph', {
            duration: 100,
            transition: 'sine:out'
        });

        linkMenu.morph({
            width: 0
        });
    });
	
	// Buttons

    // Send new link

    $('send-link').addEvent( 'click', function () {
        var newLink = new Link( 'new-link-container', $('link').get( 'value' ) );

        hideAddLink();
    });

    // Link close button
	
	$('add-new-link-close-button').addEvent( 'click', function () {
		hideAddLink();
	});

    // Undo button

    $('undo-button').addEvent( 'click', function () {
        shell.undo();
    });

    // Redo button

    $('redo-button').addEvent( 'click', function () {
        shell.redo();
    });

    // Go left

    $('go-left').addEvent( 'click', function () {
        var windowScroll = new Fx.Scroll( window).toLeft();
    });

    // Go right

    $('go-right').addEvent( 'click', function () {
        var windowScroll = new Fx.Scroll( window).toRight();
    });

    // Go down

    $('go-down').addEvent( 'click', function () {
        var windowScroll = new Fx.Scroll( window).toBottom();
    });

    // Go up

    $('go-up').addEvent( 'click', function () {
        var windowScroll = new Fx.Scroll( window).toTop();
    });
	
	// Funks
	
	function showAddLink () {
		$('add-new-link-container').set( 'morph', {
			duration: 150,
			transition: "sine:out"
		});
		
		$('add-new-link-container').setStyle( 'display', 'block' );
		
		$('add-new-link-container').morph({
			opacity: 1
		});

        // Set vertical float
        $('add-new-link').setStyle( 'margin-top', ($(window).getSize().y - $('add-new-link').getSize().y) / 2 );
	}
	
	function hideAddLink () {
		$('add-new-link-container').morph({
				opacity: 0.0
			});	
		
		(function () {			
			$('add-new-link-container').setStyle( 'display', 'none' );
		}).delay( 150 );		
	}
});
</script>
<link href="css/fonts.css" rel="stylesheet" type="text/css" />
<link href="css/style.css" rel="stylesheet" type="text/css" />
<link rel="shortcut icon" href="favicon.ico" />
</head>

<body>

<div id="add-new-link-container">
    <div id="add-new-link-background"></div>
	<div id="add-new-link">

        <div id="link-container">
            <input type="text" name="link" id="link" value="enter link" />
        </div>

        <div id="send-link">
            <div class="left-shadow"></div>
            <div id="send-text-container">add</div>
            <div class="right-shadow"></div>
        </div>

        <div id="close-button-container">
            <div id="add-new-link-close-button" class="button"></div>
        </div>

    </div>
</div>

<div id="status"></div>

<div id="menu">
    <div id="menu-bg"></div>
    <div id="undo-button" class="button"><img src="img/buttons/undo.png" border="" /></div>
    <div id="redo-button" class="button"><img src="img/buttons/redo.png" border="" /></div>
    <div id="new-link" class="add-new-link-button button"><img src="img/buttons/new_link_menu.png" border="" /></div>
    <div id="new-chain" class="add-new-chain-button button"><img src="img/buttons/new_zone.png" border="" /></div>
    <div id="go-left" class="button"><img src="img/buttons/left.png" border="" /></div>
    <div id="go-right" class="button"><img src="img/buttons/right.png" border="" /></div>
    <div id="go-down" class="button"><img src="img/buttons/down.png" border="" /></div>

    <div id="new-link-container"></div>
    <div id="full-url-container"></div>
</div>

<div id="shell-container" name="shell-container">
    <table id="shell-table" name="shell-table" cellpadding="0px" cellspacing="0" >

        <tr id="shell">
            <td id="add-new-chain-button-container"><div class="add-new-chain-button button"></div></td>
        </tr>

    </table>
</div>

<div id="footer">
    <div id="footer-bg"></div>
    <div id="footer-content">
        <div id="go-up" class="button"><img src="img/buttons/up.png" border="" /></div>
        <div id="footer-summary">
            <h1>Summary</h1>
        </div>
        <div id="footer-search">
            <h1 style="display: inline-block;">Search</h1>
            <input type="text" id="s" name="s" value="enter search" />
            <ul id="search-link-container"></ul>
        </div>
    </div>
</div>

</body>
</html>
