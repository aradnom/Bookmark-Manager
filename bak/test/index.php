<?php
require_once( "../inc/MongoMe.class.php" );

echo substr( "../test", 3 );

$mongo = new MongoMe( 'bookmarkcloud', 'users' );

$user = $mongo->findOne( array( 'user' => 'tim' ), array( 'snapshots' => 1 ) );

foreach ( $user['snapshots'] as $snapshot ) {
    echo $snapshot['time'] . "<br />";
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
<link rel="shortcut icon" href="../img/favicon.ico" />
<style type="text/css">
    .outer {
        width: 300px;
        border-radius: 10px;
        overflow: hidden;
    }

    .upper {
        width: 100%;
        height: 50px;
        background-color: #F00;
    }

    .middle {
        width: 100%;
        height: 200px;
        margin: 10px 0;
        background-color: #0f0;
    }

    .lower {
        width: 100%;
        height: 50px;
        background-color: #F00;
    }
</style>
</head>

<body>

http://www.theverge.com/2012/5/21/3034664/damon-lindelof-extended-interview-On-The-Verge-episode-006
<link rel="icon" href="//imgur.com/include/favicon.ico" type="image/x-icon"/>
'Tis a test.  Huzzah!

\<link.*?[shortcut]?\s?icon.*?(href\=\".*?\")\s*?\/\>
(www\.|http\:\/\/)(localhost|.*)[\.|\/](com|net|org|co\.uk)?(.*)
<link rel="icon" href="//media.giantbomb.com/static/vine/img/generic/favicon.ico" type="image/x-icon" />
http://localhost/bookmarkcloud/test/index.php

<title>Worth Reading: 06/22/12 - Giant Bomb</title>

</body>
</html>