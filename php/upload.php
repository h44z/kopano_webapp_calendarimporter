<?php
	/**
	 * Handle the upload request from the gui
	 *
	 * PHP Version 5
	 *
	 * @author   Christoph Haas <mail@h44z.net>
	 * @license  http://www.opensource.org/licenses/mit-license.php  MIT License
	 * @version  SVN: 13
	 */

	function respondJSON($arr) {
		
		echo json_encode($arr);
	}
	
	require_once("ical/class.icalparser.php");
	
	$filepath = $_FILES['icsdata']['tmp_name'];
	
	if(is_readable ($filepath)) {
		$ical = new ICal($filepath);	// do not init with a file.. we set the content later
				
		if(isset($ical->errors)) {
			respondJSON(array ('success'=>false,'errors'=>array ('parser'=>$ical->errors, 'type'=>'parser')));
		} else if(!$ical->hasEvents()) {
			respondJSON(array ('success'=>false,'errors'=>array ('parser'=>"No events in ics file", 'type'=>'parser')));
		} else {
			respondJSON(array ('success'=>true, 'response'=>array ('tmp_file'=>$filepath, 'calendar'=>$ical->calendar(), 'events'=>$ical->events())));
		}
	} else {
		respondJSON(array ('success'=>false,'errors'=>array ('reader'=>"File could not be read by server", 'type'=>'reader')));
	}
?>