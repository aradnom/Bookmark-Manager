<?php
/* 	
	Database later for MongoDB.  Will include basic functionality for
	the time being and will likely grow as necessary.	
*/

class MongoMe {
	private $dbname;
	private $mongo;
	private $db;
	private $collection;
	private $collectionName;
	private $results;
	private $return_as_array = false;
    private $error;
    private $errorCode;
	
	// DB name must be passed to constructor, though collection is optional and can be set later
	public function MongoMe ( $dbname, $user = null, $pass = null, $collection = null ) {
		$this->dbname = $dbname;

        try {
            $this->mongo = new Mongo();
        } catch ( MongoConnectionException $e ) {
            $this->error = $e->getMessage();
            $this->errorCode = $e->getCode();

            return false;
        }

		$this->db = $this->mongo->$dbname;

        if ( $user != null )
            $this->db->authenticate( $user, $pass );
		
		$this->collectionName = $collection;
		
		if ( $collection )
			$this->collection = $this->db->$collection;
	}
	
	// Returns single records based on record id
	public function getSingleFromID ( $id ) {
		if ( $this->collection ) {
			$this->results = $this->collection->findOne( array( '_id' => new MongoId( $id ) ) );
			
			return $this->returnResults();
		}			 
	}	
	
	// Returns all records in collections.
	public function getAll ( $fields = array() ) {
		if ( $this->collection ) {
			$this->results = $this->collection->find( array(), $fields );
			
			return $this->returnResults();
		}			
	}
	
	// Note that properties is an array of k => v pairs.
	public function find ( $properties = array(), $fields = array() ) {
		if ( $this->collection && !empty( $properties ) ) {
			$this->results = $this->collection->find( $properties, $fields );
			
			return $this->returnResults();
		}
	}
	
	// Works same as above but only returns a single record based on search properties
	public function findOne ( $properties, $fields = array() ) {
		if ( $this->collection && !empty( $properties ) ) {
            try {
                $this->results = $this->collection->findOne( $properties, $fields );
            } catch ( MongoConnectionException $e ) {
                $this->error = $e->getMessage();
                $this->errorCode = $e->getCode();
            }

            return $this->results;
		}
	}
	
	// Return results using a javascript snippet (function)
	// Should look like
	//	"function() {
    //		return this.name == 'Joe' || this.age == 50;
	//	}";
	public function findJS ( $js = null ) {
		if ( $this->collection && $js != null ) {
			$this->results = $this->collection->find( array( '$where' => $js ) );
			
			return $this->returnResults();	
		}
	}
	
	// Return values based on range of property
	public function getRange( $property, $lower = null, $upper = null ) {
		if ( ($lower || $upper) && $this->collection ) {
			$searchArray = array( $property => array() );
			
			if ( $lower )
				$searchArray[$property]['$gt'] = $lower;
				
			if ( $upper )
				$searchArray[$property]['$lt'] = $upper;
				
			$this->results = $this->collection->find( $searchArray );
				
			return $this->returnResults();
		}	
	}
	
	// Update field by object id or other search properties.  Will favor ID if present.
	// $properties should be an array of the form "p1" => value, "p2" => value, etc.
	// if replace is set ENTIRE RECORD will be replaced with updateProperties and you probably
	// don't want that.
	public function update ( $id = null, $searchProperties = null, $updateProperties, $replace = false, $options = null ) {
		if ( $this->collection ) {
            $search = $searchProperties;
            $update = $updateProperties;

			if ( $id && $searchProperties ) {
				$search["_id"] = $id;
				
				if ( !$replace )
                    $update = array( '$set' => $updateProperties );
			} elseif ( $id ) {
				if ( $replace )
                    $search = array( "_id" => $id );
				else {
                    $search = array( "_id" => $id );
                    $update = array( '$set' => $updateProperties );
                }
			} elseif ( $searchProperties ) {
				if ( !$replace )
                    $update = array( '$set' => $updateProperties );
			}

            try {
                return $this->collection->update( $search, $update, $options );
            } catch ( MongoCursorException $e ) {
                $this->error = $e->getMessage();
                $this->errorCode = $e->getCode();
            }
		}
	}
	
	// Insert into DB using array pairs.  Collections can be nested ( array( array() ).
	// Options is an assoc array.  Valid options are fsync => bool, safe => bool and
	// timeout => int (in ms).
	public function insert ( $properties, $options = null ) {
		if ( $this->collection && !empty( $properties ) ) {
			return $options ? $this->collection->insert( $properties, $options ) : $this->collection->insert( $properties );	
		}
	}
	
	// Remove from array based on ID or search.  Options is an assoc array with the following
	// valid properties: "justOne" => bool, "safe" => bool, "fsync" => bool, "timeout" => int (in ms)
	// Either an ID or search properties must be passed with preference to ID.  If both are passed, ID
	// Will simply be used as a search parameter along with $properties.  If _id is passed with properties
	// it will be overwritten by $id.
	public function delete ( $id = null, $properties = null, $options = null ) {
		if ( $this->collection ) {
			if ( $id && $properties ) {
				$properties["_id"] = $id;
				
				return $options ? $this->collection->remove( $properties, $options ) : $this->collection->remove( $properties );
			} elseif ( $id )
				return $options ? $this->collection->remove( array( "_id" => $id ), $options ) : $this->collection->remove( array( "_id" => $id ) );	
			elseif ( $properties )
				return $options ? $this->collection->remove( $properties, $options ) : $this->collection->remove( $properties );	
			else
				return false;
		}		
	}
	
	// Internal functions //////////////////////////////////////////////////////////////
	
	private function returnResults () {
		if ( $this->collection && !empty( $this->results ) )
			return $this->return_as_array ? 
				iterator_to_array( $this->results, false ) : $this->results;
		else
			return false;
	}
	
	// Getters and setters for class properties ////////////////////////////////////////
	
	public function setCollectionName ( $collection ) {
		if ( $collection ) {
			$this->collectionName = $collection;
			$this->collection = $this->db->$collection;			
		}
	}
	
	// Retrieve collection name for reference
	public function getCollectionName () {
		return $this->collectionName ? $this->collectionName : false;	
	}
	
	// If return_as_array is set will return as regular array instead of mongo object 
	// (can be easier to manipulate)
	public function setReturnAsArray ( $true_or_false ) {
		$this->return_as_array = $true_or_false ? true : false;
	}
	
	public function getReturnAsArray () {
		return $this->return_as_array;
	}

    public function getError () {
        return $this->error;
    }

    public function getErrorCode () {
        return $this->errorCode;
    }
}

?>