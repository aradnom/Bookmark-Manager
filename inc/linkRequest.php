<?php
/**
 * @author Tim Shaw
 * @date 6/21/12
 * @time 12:04 PM
 */

include("defines_and_functions.php");

if ( isset( $_GET['url']  ) ) {
    //$urlRegex = "/(http\:\/\/|www\.|[a-zA-Z\.])?([a-zA-Z]*\.[com|net|org|co\.uk])(.*)/i";
    $url = $_GET['url'];

    if ( isset( $_GET['getBase'] ) )
        getBase( $url );

    if ( isset( $_GET['getIcon'] ) )
        getIcon( $url );

    if ( isset( $_GET['getTitle'] ) )
        getTitle( $url );
}

function getBase ( $url ) {
    // Blank array for converting to JSON
    $results = array();

    // Basic url info
    $urlInfo = parse_url( $url );
    $base = $urlInfo['host'];
    $results['base'] = $base;

    if ( !empty($results) )
        echo json_encode( $results );
}

function getTitle ( $url ) {
    $titleRegex = "/\<title\>(.+)\<\/title\>/i";

    // Blank array for converting to JSON
    $results = array();

    // Get title from page source
    $page = file_get_contents( $url );

    // Get title element from page
    if ( preg_match( $titleRegex, $page, $matches ) )
        $results['title'] = $matches[1];

    if ( !empty($results) )
        echo json_encode( $results );
}

function getIcon ( $url ) {
    $shortcutRegex = "/<link[\s\S]?.*?[shortcut]?\s?icon.*?href\=\"(.*?)\"\s.*?\/\>/i";

    // Blank array for converting to JSON
    $results = array();

    // Basic url info
    $urlInfo = parse_url( $url );
    $base = $urlInfo['host'];
    $results['base'] = $base;

    // First check <site>/favicon.ico because that works a lot
    $headers = get_headers( "http://" . $base . "/favicon.ico", 1 );

    if ( checkHeaders( $headers ) )
        $results['icon'] = "http://" . $base . "/favicon.ico";

    // Fine, try png instead
    if ( !isset( $results['icon'] ) ) {
        $headers = get_headers( "http://" . $base . "/favicon.png", 1 );

        if ( checkHeaders( $headers ) )
            $results['icon'] = "http://" . $base . "/favicon.png";
    }

    // Okay fine, we'll fetch the actual icon path from the page
    // But I'm not bitter
    if ( !isset( $results['icon'] ) ) {
        $page = file_get_contents( $url );

        if ( preg_match( $shortcutRegex, $page, $matches ) ) {
            //print_r( $matches );
            if ( substr( $matches[1], 0, 3 ) == '../' )
                $results['icon'] = 'http://' . $base . '/' . substr( $matches[1], 3 );
            else if ( substr( $matches[1], 0, 2 ) == '//' )
                $results['icon'] = $matches[1];
            else if ( substr( $matches[1], 0, 1 ) == '/' )
                $results['icon'] = 'http://' . $base . '/' . substr( $matches[1], 1 );
            else
                $results['icon'] = $matches[1];
        } else
            // Screw it, return default icon
            $results['icon'] = DEFAULT_ICON_PATH;
    }

    if ( !empty($results) )
        echo json_encode( $results );
}

function checkHeaders ( $headers ) {
    if ( isset( $headers['Content-Type'] ) )
        if ( is_array( $headers['Content-Type'] ) ) {
            foreach ( $headers['Content-Type'] as $k => $v )
                if ( ( $v == 'image/x-icon' || $v == 'image/png' ) && $headers['Content-Length'][$k] > 0 )
                    return true;
        } else
            if ( ( $headers['Content-Type'] == 'image/x-icon' || $headers['Content-Type'] == 'image/png' ) && $headers['Content-Length'] > 0 )
                return true;

    return false;
}