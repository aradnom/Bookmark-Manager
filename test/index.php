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

<body on>

http://www.theverge.com/2012/5/21/3034664/damon-lindelof-extended-interview-On-The-Verge-episode-006
<link rel="icon" href="//imgur.com/include/favicon.ico" type="image/x-icon"/>
'Tis a test.  Huzzah!

\<link.*?[shortcut]?\s?icon.*?(href\=\".*?\")\s*?\/\>
(www\.|http\:\/\/)(localhost|.*)[\.|\/](com|net|org|co\.uk)?(.*)
<link rel="icon" href="//media.giantbomb.com/static/vine/img/generic/favicon.ico" type="image/x-icon" />
http://localhost/bookmarkcloud/test/index.php

<title>Worth Reading: 06/22/12 - Giant Bomb</title>

name="publisher" content="Kotaku Australia" /><meta
    name="robots" content="noarchive" /><meta
    name="author" content="Katie Williams" /><meta
    property="og:title" content="I Can Be Just As Capable. Let Me." /><meta
    property="og:image" content="http://edge.alluremedia.com.au/m/k/2012/06/wasd-300x169.jpg" /><meta
    property="og:description" content="When I sit down at a computer, my left hand falls automatically into the inverted-V shape known well by all of you; middle three fingers arched across..." /><meta
    itemprop="name" content="I Can Be Just As Capable. Let Me."><meta
    itemprop="image" content="http://edge.alluremedia.com.au/m/k/2012/06/wasd-300x169.jpg"><meta
    itemprop="description" content="When I sit down at a computer, my left hand falls automatically into the inverted-V shape known well by all of you; middle three fingers arched across..."><link
    rel="sitemap" type="application/xml" title="Sitemap" href="http://www.kotaku.com.au/sitemap.xml"><link
    rel="shortcut icon" type="image/x-icon" href="http://edge.alluremedia.com.au/i/ico/favicon_kotaku.ico" /><link
    rel="apple-touch-icon-precomposed" type="image/png" href="http://edge.alluremedia.com.au/i/ico/favicon_kotaku_57.png" /><link
    rel="apple-touch-icon-precomposed" type="image/png" sizes="72x72" href="http://edge.alluremedia.com.au/i/ico/favicon_kotaku_72.png" /><link
    rel="apple-touch-icon-precomposed" type="image/png" sizes="114x114" href="http://edge.alluremedia.com.au/i/ico/favicon_kotaku_114.png" /><link
    rel="alternate" type="application/rss+xml" title="Kotaku Australia RSS" href="http://feeds.kotaku.com.au/KotakuAustralia" /><link
    rel="alternate" type="application/rss+xml" title="Kotaku Australia RSS - Australian Stories" href="http://feeds.kotaku.com.au/KotakuAustraliaAU" /><script type='text/javascript' src='http://use.typekit.com/wpr8ywj.js?ver=3.4'></script><script type='text/javascript' src='http://network.alluremedia.com.au/network/www/delivery/spcjs.php?id=6&#038;ver=3.4'></script><link
    rel='prev' title='When The Ocarina Of Time Takes Things A Little Too Far' href='http://www.kotaku.com.au/2012/06/when-the-ocarina-of-time-takes-things-a-little-too-far/' /><link
    rel='next' title='A Hard-Drive In Slow Motion Is A Thing Of Beauty' href='http://www.kotaku.com.au/2012/06/a-hard-drive-in-slow-motion-is-a-thing-of-beauty/' /><link
    rel='canonical' href='http://www.kotaku.com.au/2012/06/513794/' /><script type="text/javascript">var _sf_startpt=(new Date()).getTime()</script><script type="text/javascript">try{Typekit.load();}catch(e){}</script><script src="http://www.googletagservices.com/tag/js/gpt.js"></script><script type="text/javascript">
    googletag.cmd.push(function() {
        googletag.defineSlot("/1027487/KOTAU_T-InRealLife_Fireplace", [1680, 1050], "div-gpt-ad-1331000579477-0").addService(googletag.pubads());
        googletag.defineSlot("/1027487/KOTAU_T-InRealLife_Leaderboard_Top", [728, 90], "div-gpt-ad-1331000579477-2").addService(googletag.pubads());
        googletag.defineSlot("/1027487/KOTAU_T-InRealLife_MREC", [300, 250], "div-gpt-ad-1331000579477-3").addService(googletag.pubads());
        googletag.defineSlot("/1027487/KOTAU_T-InRealLife_Skyscraper", [300, 600], "div-gpt-ad-1331000579477-4").addService(googletag.pubads());
        googletag.defineSlot("/1027487/KOTAU_Home_TextAdvertisement", [575, 60], "div-gpt-ad-1331000579477-5").addService(googletag.pubads());
        googletag.pubads().setTargeting("Tags", "au,e3,feature,public-relations,sexism,women");
        googletag.pubads().enableSyncRendering();
        googletag.pubads().enableSingleRequest();

</body>
</html>