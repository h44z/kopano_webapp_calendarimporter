<?php
$basedir  = $_GET["basedir"];
$secid    = $_GET["secid"];
$fileid   = $_GET["fileid"];
$realname = $_GET["realname"];

$secfile = $basedir . "/secid." . $secid;
$icsfile = $basedir . "/" . $fileid . "." . $secid;

// if the secid file exists -> download!
if(file_exists($secfile)) {
	@header("Last-Modified: " . @gmdate("D, d M Y H:i:s",time()) . " GMT");
	@header("Content-type: text/calendar");
	header("Content-Length: " . filesize($icsfile));
	header("Content-Disposition: attachment; filename=" . $realname . ".ics");

	//write ics
	readfile($icsfile);
	unlink($secfile);
	unlink($icsfile);
}

?>