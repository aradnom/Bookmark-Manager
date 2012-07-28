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

    update_bookmarks_mongo( $newSnapshot );

// Read current bookmarks if user is set
} elseif ( isset( $_POST['user'] ) || isset( $_GET['user'] ) ) {
    read_bookmarks_mongo( $_POST['level'] );
}

// Functions for processing snapshots with both Mongo and MySQL

function read_bookmarks_mysql ( $level ) {

}

function update_bookmarks_mysql ( $newSnapshot ) {

}

function read_bookmarks_mongo ( $level ) {
    include( "../inc/auth.php" );

    $mongo = new MongoMe( $database, $user, $pass, $collection );

    // Retrieve user bookmarks from db
    $bookmarks = $mongo->findOne( array( 'user' => USER ), array( 'snapshots' => 1 ) );

    // Send top (newest) snapshot back if nothing went wrong
    if ( $bookmarks )
        if ( empty( $bookmarks ) || empty( $bookmarks['snapshots'][$level] ) )
            echo  '{"error":' . '"' . "No bookmarks to retrieve" . '"' . ', "code":' . '"' . $mongo->getErrorCode() . '"' . '}';
        else
            echo json_encode( $bookmarks['snapshots'][$level] );
    else
        echo  '{"error":' . '"' . $mongo->getError() . '"' . ', "code":' . '"' . $mongo->getErrorCode() . '"' . '}';
}

function update_bookmarks_mongo ( $newSnapshot ) {
    include( "../inc/auth.php" );

    // Return immediately if snapshot is empty
    if ( !isset( $newSnapshot ) || empty( $newSnapshot ) ) {
        echo  '{"error":' . '"' . 'Empty snapshot' . '"' . '}';
        return false;
    }

    $mongo = new MongoMe( $database, $user, $pass, $collection );

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
    $success = $mongo->update( null, array( 'user' => 'tim' ), array( 'snapshots' => $snapshots ), false, array( 'safe' => true ) );

    if ( !$success )
        echo  '{"error":' . '"' . $mongo->getError() . '"' . ', "code":' . '"' . $mongo->getErrorCode() . '"' . '}';
}