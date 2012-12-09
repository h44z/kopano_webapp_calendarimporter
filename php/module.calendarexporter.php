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
 
include_once('mapi/class.recurrence.php');
 
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
		$icshead = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Zarafa Webapp//Zarafa Calendar Exporter//DE\nMETHOD:PUBLISH\nX-WR-CALNAME:" . $calname. "\nX-WR-TIMEZONE:" . date("e") . "\n";
		fwrite($fh, $icshead);
	}
	
	private function writeICSEnd($fh) {
		$icsend = "END:VCALENDAR";
		fwrite($fh, $icsend);
	}
	
	private function getIcalDate($time, $incl_time = true) {
		return $incl_time ? date('Ymd\THis', $time) : date('Ymd', $time);
	}
	
	private function writeEvent($fh, $event) {
		$head = "BEGIN:VEVENT\n";
		$end  = "END:VEVENT\n";
		
		$busystate = array("FREE", "TENTATIVE", "BUSY", "OOF");
		
		$fields = array(
			"UID" 							=> $this->randomstring(10) . "-" . $this->randomstring(5) . "-ics@zarafa-export-plugin",  // generate uid
			"DTSTART" 						=> $this->getIcalDate($event["commonstart"]) . "Z",	// this times are utc!
			"DTEND" 						=> $this->getIcalDate($event["commonend"]) . "Z",
			"DTSTAMP" 						=> $this->getIcalDate($event["creation_time"]) . "Z",
			"CREATED" 						=> $this->getIcalDate($event["creation_time"]) . "Z",
			"X-MICROSOFT-CDO-BUSYSTATUS" 	=> $busystate[$event["busystatus"]],
			"LAST-MODIFIED" 				=> $this->getIcalDate($event["last_modification_time"]),
			"DESCRIPTION" 					=> str_replace("\n", "\\n",$event["description"]),
			"LOCATION" 						=> $event["location"],
			"SUMMARY" 						=> $event["subject"],
			
			// some static content...
			"TRANSP" 						=> "OPAQUE",
			"SEQUENCE"						=> "0"
		);
		
		fwrite($fh, $head);
		
		// event fields:
		foreach ($fields as $key => $value) {
			fwrite($fh, $key . ":" . $value . "\n");
		}
		
		unset($fields); 
		
		fwrite($fh, $end);
	}
	
	private function loadEventDescription($event) {
		$entryid = $this->getActionEntryID($event);
		$store = $this->getActionStore($event);
		
		$basedate = null;
		
		$properties = $GLOBALS['properties']->getAppointmentProperties();
		$plaintext = true;
		
		$data = array();
		
		if($store && $entryid) {			
			$message = $GLOBALS['operations']->openMessage($store, $entryid);
			
			
			// add all standard properties from the series/normal message 
			$data['item'] = $GLOBALS['operations']->getMessageProps($store, $message, $properties, (isset($plaintext) && $plaintext));
			
			// if appointment is recurring then only we should get properties of occurence if basedate is supplied
			if($data['item']['props']['recurring'] === true) {
				if(isset($basedate) && $basedate) {
					$recur = new Recurrence($store, $message);

					$exceptionatt = $recur->getExceptionAttachment($basedate);

					// Single occurences are never recurring
					$data['item']['props']['recurring'] = false;

					if($exceptionatt) {
						// Existing exception (open existing item, which includes basedate)
						$exceptionattProps = mapi_getprops($exceptionatt, array(PR_ATTACH_NUM));
						$exception = mapi_attach_openobj($exceptionatt, 0);

						// overwrite properties with the ones from the exception
						$exceptionProps = $GLOBALS['operations']->getMessageProps($store, $exception, $properties, (isset($plaintext) && $plaintext));

						/**
						 * If recurring item has set reminder to true then
						 * all occurrences before the 'flagdueby' value(of recurring item)
						 * should not show that reminder is set.
						 */
						if (isset($exceptionProps['props']['reminder']) && $data['item']['props']['reminder'] == true) {
							$flagDueByDay = $recur->dayStartOf($data['item']['props']['flagdueby']);

							if ($flagDueByDay > $basedate) {
								$exceptionProps['props']['reminder'] = false;
							}
						}

						// The properties must be merged, if the recipients or attachments are present in the exception
						// then that list should be used. Otherwise the list from the series must be applied (this
						// corresponds with OL2007).
						// @FIXME getMessageProps should not return empty string if exception doesn't contain body
						// by this change we can handle a situation where user has set empty string in the body explicitly
						if (!empty($exceptionProps['props']['body']) || !empty($exceptionProps['props']['html_body'])) {
							if(!empty($exceptionProps['props']['body'])) {
								$data['item']['props']['body'] = $exceptionProps['props']['body'];
							}

							if(!empty($exceptionProps['props']['html_body'])) {
								$data['item']['props']['html_body'] = $exceptionProps['props']['html_body'];
							}

							$data['item']['props']['isHTML'] = $exceptionProps['props']['isHTML'];
						}
						// remove properties from $exceptionProps so array_merge will not overwrite it
						unset($exceptionProps['props']['html_body']);
						unset($exceptionProps['props']['body']);
						unset($exceptionProps['props']['isHTML']);

						$data['item']['props'] = array_merge($data['item']['props'], $exceptionProps['props']);
						if (isset($exceptionProps['recipients'])) {
							$data['item']['recipients'] = $exceptionProps['recipients'];
						}

						if (isset($exceptionProps['attachments'])) {
							$data['item']['attachments'] = $exceptionProps['attachments'];
						}

						// Make sure we are using the passed basedate and not something wrong in the opened item
						$data['item']['props']['basedate'] = $basedate;
					} else {
						// opening an occurence of a recurring series (same as normal open, but add basedate, startdate and enddate)
						$data['item']['props']['basedate'] = $basedate;
						$data['item']['props']['startdate'] = $recur->getOccurrenceStart($basedate);
						$data['item']['props']['duedate'] = $recur->getOccurrenceEnd($basedate);
						$data['item']['props']['commonstart'] = $data['item']['props']['startdate'];
						$data['item']['props']['commonend'] = $data['item']['props']['duedate'];
						unset($data['item']['props']['reminder_time']);

						/**
						 * If recurring item has set reminder to true then
						 * all occurrences before the 'flagdueby' value(of recurring item)
						 * should not show that reminder is set.
						 */
						if (isset($exceptionProps['props']['reminder']) && $data['item']['props']['reminder'] == true) {
							$flagDueByDay = $recur->dayStartOf($data['item']['props']['flagdueby']);

							if ($flagDueByDay > $basedate) {
								$exceptionProps['props']['reminder'] = false;
							}
						}
					}
				} else {
					// Opening a recurring series, get the recurrence information
					$recur = new Recurrence($store, $message);
					$recurpattern = $recur->getRecurrence();
					$tz = $recur->tz; // no function to do this at the moment

					// Add the recurrence pattern to the data
					if(isset($recurpattern) && is_array($recurpattern)) {
						$data['item']['props'] += $recurpattern;
					}

					// Add the timezone information to the data
					if(isset($tz) && is_array($tz)) {
						$data['item']['props'] += $tz;
					}
				}
			}
		}

		return $data['item']['props']['body'];
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
			$event["props"]["description"] = $this->loadEventDescription($event);
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
