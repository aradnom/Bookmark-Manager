<?php
/**
 * @author Tim Shaw
 * @date 5/29/12
 * @description Class responsible for persisting bookmark data to and from database
 */

require_once( "../inc/defines_and_functions.php" );
require_once( "../inc/MongoMe.class.php" );

// Upload new changes if bookmarks is set
if ( isset( $_POST['bookmarks'] ) ) {
    //$bookmarks = new stdClass;
    $snapshots = array();
    $newSnapshot = json_decode( $_POST['bookmarks'], true );
    $mongo = new MongoMe( DATABASE, COLLECTION );

    $currentSnapshots = $mongo->findOne( array( 'user' => USER ), array( 'snapshots' => 1 ) );

    // Set time of new snapshot and push to array so newest always at top
    $newSnapshot['time'] = time();

    $snapshots[] = $newSnapshot;

    // Populate remaining snapshots using top 4 so snapshots will always be ordered
    // newest --> oldest without shuffling anything
    if ( !empty( $currentSnapshots['snapshots'] ) )
        foreach ( array_slice( $currentSnapshots['snapshots'], 0, SNAPSHOT_LIMIT - 1 ) as $snapshot ) {
            $snapshots[] = $snapshot;
        }

    // Send updated snapshots to db
    $mongo->update( null, array( 'user' => 'tim' ), array( 'snapshots' => $snapshots ), false, true );

// Read current bookmarks if user is set
} elseif ( isset( $_POST['user'] ) ) {
    $mongo = new MongoMe( DATABASE, COLLECTION );
    $level = $_POST['level'];

    // Retrieve user bookmarks from db
    $bookmarks = $mongo->findOne( array( 'user' => USER ), array( 'snapshots' => 1 ) );

    // Send top (newest) snapshot back
     echo json_encode( $bookmarks['snapshots'][$level] );
}