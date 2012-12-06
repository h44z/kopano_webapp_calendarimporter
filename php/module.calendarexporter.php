<?php
/**
 * class.calendarexporter.php, zarafa calender to ics exporter
 *
 * Author: Christoph Haas <christoph.h@sprinternet.at>
 * Copyright (C) 2012 Christoph Haas
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */

/**
 * This module integrates Owncloud into attachment part of emails
 * @class OwncloudModule
 * @extends Module
 */
class CalendarexporterModule extends Module {

	private $DEBUG = true; 	// enable error_log debugging

	/**
	 * @constructor
	 * @param $id
	 * @param $data
	 */
	public function __construct($id, $data) {
			parent::Module($id, $data);	
	}

	/**
	 * Executes all the actions in the $data variable.
	 * Exception part is used for authentication errors also
	 * @return boolean true on success or false on failure.
	 */
	public function execute() {
		$result = false;

		foreach($this->data as $actionType => $actionData) {	
			if(isset($actionType)) {
				try {
					if($this->DEBUG) {
						error_log("exec: " . $actionType);
					}
					switch($actionType) {
						case "export":
							$result = $this->exportCalendar($actionType, $actionData);
							break;									
						default:
							$this->handleUnknownActionType($actionType);
					}

				} catch (MAPIException $e) {
					if($this->DEBUG) {
						error_log("mapi exception: " . $e->getMessage());
					}
				} catch (Exception $e) {
					if($this->DEBUG) {
						error_log("exception: " . $e->getMessage());
					}
				}
			}
		}
		
		return $result;
	}
	
	private function randomstring($length = 6) {
		// $chars - all allowed charakters
		$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

		srand((double)microtime()*1000000);
		$i = 0;
		while ($i < $length) {
			$num = rand() % strlen($chars);
			$tmp = substr($chars, $num, 1);
			$pass = $pass . $tmp;
			$i++;
		}
		return $pass;
	}
	
	private function createSecIDFile($secid) {
		$lockFile = TMP_PATH . "/secid." . $secid;
		$fh = fopen($lockFile, 'w') or die("can't open secid file");
		$stringData = date(DATE_RFC822);
		fwrite($fh, $stringData);
		fclose($fh);
	}
	
	private function writeICSHead($fh, $calname) {
		$icshead = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Zarafa Webapp//Zarafa Calendar Exporter//DE\nMETHOD:PUBLISH\nX-WR-CALNAME:" . $calname. "\n";
		fwrite($fh, $icshead);
	}
	
	private function writeICSEnd($fh) {
		$icsend = "END:VCALENDAR";
		fwrite($fh, $icsend);
	}
	
	private function writeEvent($fh, $event) {
		$head = "BEGIN:VEVENT\n";
		$end  = "END:VEVENT\n";
		
		$fields = array(
			"DTSTART" => $event["startdate"],
			"DTEND" => $event["duedate"],
			"DTSTAMP" => $event["creation_time"],
			"DESCRIPTION" => "nothing...",
			"LOCATION" => $event["location"],
			"SUMMARY" => $event["subject"]		
		);
		
		fwrite($fh, $head);
		
		// event fields:
		foreach ($fields as $key => $value) {
			fwrite($fh, $key . ": " . $value . "\n");
		}
		
		unset($fields); 
		
		fwrite($fh, $end);
	}
	
	private function exportCalendar($actionType, $actionData) {
		$secid = $this->randomstring();	
		$this->createSecIDFile($secid);
		$tmpname = stripslashes($actionData["calendar"] . ".ics." . $this->randomstring(8));
		$filename = TMP_PATH . "/" . $tmpname . "." . $secid;
		
		// create ics file....
		$fh = fopen($filename, 'w') or die("can't open ics file");
		$this->writeICSHead($fh, $actionData["calendar"]);
		
		foreach($actionData["data"]["item"] as $event) {
			$this->writeEvent($fh, $event["props"]);
		}
		
		$this->writeICSEnd($fh);
		fclose($fh);
		
		$response['status']	=	true;
		$response['fileid'] =	$tmpname;	// number of entries that will be exported
		$response['basedir'] = TMP_PATH;
		$response['secid']  =   $secid;
		$response['realname'] = $actionData["calendar"];
		$this->addActionData($actionType, $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
		
		if($this->DEBUG) {
			error_log("export done, bus data written!");
		}
		
	}
};

?>
