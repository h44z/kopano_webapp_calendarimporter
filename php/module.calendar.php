<?php
/**
 * module.calendar.php, zarafa calender to ics im/exporter
 *
 * Author: Christoph Haas <christoph.h@sprinternet.at>
 * Copyright (C) 2012-2014 Christoph Haas
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

include_once('vendor/autoload.php');

use Sabre\VObject;

class CalendarModule extends Module
{

	private $DEBUG = true;    // enable error_log debugging

	/**
	 * @constructor
	 * @param $id
	 * @param $data
	 */
	public function __construct($id, $data)
	{
		parent::Module($id, $data);
	}

	/**
	 * Executes all the actions in the $data variable.
	 * Exception part is used for authentication errors also
	 * @return boolean true on success or false on failure.
	 */
	public function execute()
	{
		$result = false;

		if (!$this->DEBUG) {
			/* disable error printing - otherwise json communication might break... */
			ini_set('display_errors', '0');
		}

		foreach ($this->data as $actionType => $actionData) {
			if (isset($actionType)) {
				try {
					if ($this->DEBUG) {
						error_log("exec: " . $actionType);
					}
					switch ($actionType) {
						case "load":
							$result = $this->loadCalendar($actionType, $actionData);
							break;
						case "export":
							$result = $this->exportCalendar($actionType, $actionData);
							break;
						case "import":
							$result = $this->importCalendar($actionType, $actionData);
							break;
						case "importattachment":
							$result = $this->getAttachmentPath($actionType, $actionData);
							break;
						default:
							$this->handleUnknownActionType($actionType);
					}

				} catch (MAPIException $e) {
					if ($this->DEBUG) {
						error_log("mapi exception: " . $e->getMessage());
					}
				} catch (Exception $e) {
					if ($this->DEBUG) {
						error_log("exception: " . $e->getMessage());
					}
				}
			}
		}

		return $result;
	}

	/**
	 * Generates a random string with variable length.
	 * @param $length the lenght of the generated string
	 * @return string a random string
	 */
	private function randomstring($length = 6)
	{
		// $chars - all allowed charakters
		$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

		srand((double)microtime() * 1000000);
		$i = 0;
		$pass = "";
		while ($i < $length) {
			$num = rand() % strlen($chars);
			$tmp = substr($chars, $num, 1);
			$pass = $pass . $tmp;
			$i++;
		}
		return $pass;
	}

	/**
	 * The main export function, creates the ics file for download
	 * @param $actionType
	 * @param $actionData
	 */
	private function exportCalendar($actionType, $actionData)
	{
		// TODO: implement
	}

	/**
	 * The main import function, parses the uploaded ics file
	 * @param $actionType
	 * @param $actionData
	 */
	private function importCalendar($actionType, $actionData)
	{
		// TODO: implement
	}

	/**
	 * Store the file to a temporary directory, prepare it for oc upload
	 * @param $actionType
	 * @param $actionData
	 * @private
	 */
	private function getAttachmentPath($actionType, $actionData)
	{
		// Get store id
		$storeid = false;
		if (isset($actionData["store"])) {
			$storeid = $actionData["store"];
		}

		// Get message entryid
		$entryid = false;
		if (isset($actionData["entryid"])) {
			$entryid = $actionData["entryid"];
		}

		// Check which type isset
		$openType = "attachment";

		// Get number of attachment which should be opened.
		$attachNum = false;
		if (isset($actionData["attachNum"])) {
			$attachNum = $actionData["attachNum"];
		}

		// Check if storeid and entryid isset
		if ($storeid && $entryid) {
			// Open the store
			$store = $GLOBALS["mapisession"]->openMessageStore(hex2bin($storeid));

			if ($store) {
				// Open the message
				$message = mapi_msgstore_openentry($store, hex2bin($entryid));

				if ($message) {
					$attachment = false;

					// Check if attachNum isset
					if ($attachNum) {
						// Loop through the attachNums, message in message in message ...
						for ($i = 0; $i < (count($attachNum) - 1); $i++) {
							// Open the attachment
							$tempattach = mapi_message_openattach($message, (int)$attachNum[$i]);
							if ($tempattach) {
								// Open the object in the attachment
								$message = mapi_attach_openobj($tempattach);
							}
						}

						// Open the attachment
						$attachment = mapi_message_openattach($message, (int)$attachNum[(count($attachNum) - 1)]);
					}

					// Check if the attachment is opened
					if ($attachment) {

						// Get the props of the attachment
						$props = mapi_attach_getprops($attachment, array(PR_ATTACH_LONG_FILENAME, PR_ATTACH_MIME_TAG, PR_DISPLAY_NAME, PR_ATTACH_METHOD));
						// Content Type
						$contentType = "application/octet-stream";
						// Filename
						$filename = "ERROR";

						// Set filename
						if (isset($props[PR_ATTACH_LONG_FILENAME])) {
							$filename = $props[PR_ATTACH_LONG_FILENAME];
						} else {
							if (isset($props[PR_ATTACH_FILENAME])) {
								$filename = $props[PR_ATTACH_FILENAME];
							} else {
								if (isset($props[PR_DISPLAY_NAME])) {
									$filename = $props[PR_DISPLAY_NAME];
								}
							}
						}

						// Set content type
						if (isset($props[PR_ATTACH_MIME_TAG])) {
							$contentType = $props[PR_ATTACH_MIME_TAG];
						} else {
							// Parse the extension of the filename to get the content type
							if (strrpos($filename, ".") !== false) {
								$extension = strtolower(substr($filename, strrpos($filename, ".")));
								$contentType = "application/octet-stream";
								if (is_readable("mimetypes.dat")) {
									$fh = fopen("mimetypes.dat", "r");
									$ext_found = false;
									while (!feof($fh) && !$ext_found) {
										$line = fgets($fh);
										preg_match("/(\.[a-z0-9]+)[ \t]+([^ \t\n\r]*)/i", $line, $result);
										if ($extension == $result[1]) {
											$ext_found = true;
											$contentType = $result[2];
										}
									}
									fclose($fh);
								}
							}
						}


						$tmpname = tempnam(TMP_PATH, stripslashes($filename));

						// Open a stream to get the attachment data
						$stream = mapi_openpropertytostream($attachment, PR_ATTACH_DATA_BIN);
						$stat = mapi_stream_stat($stream);
						// File length =  $stat["cb"]

						$fhandle = fopen($tmpname, 'w');
						$buffer = null;
						for ($i = 0; $i < $stat["cb"]; $i += BLOCK_SIZE) {
							// Write stream
							$buffer = mapi_stream_read($stream, BLOCK_SIZE);
							fwrite($fhandle, $buffer, strlen($buffer));
						}
						fclose($fhandle);

						$response = array();
						$response['tmpname'] = $tmpname;
						$response['filename'] = $filename;
						$response['status'] = true;
						$this->addActionData($actionType, $response);
						$GLOBALS["bus"]->addData($this->getResponseData());
					}
				}
			} else {
				$response['status'] = false;
				$response['message'] = "Store could not be opened!";
				$this->addActionData($actionType, $response);
				$GLOBALS["bus"]->addData($this->getResponseData());
			}
		} else {
			$response['status'] = false;
			$response['message'] = "Wrong call, store and entryid have to be set!";
			$this->addActionData($actionType, $response);
			$GLOBALS["bus"]->addData($this->getResponseData());
		}
	}

	/**
	 * Function that parses the uploaded ics file and posts it via json
	 * @param $actionType
	 * @param $actionData
	 */
	private function loadCalendar($actionType, $actionData)
	{
		$error = false;
		$error_msg = "";

		if (is_readable($actionData["ics_filepath"])) {
			$parser = null;

			try {
				$parser = VObject\Reader::read(
					fopen($actionData["ics_filepath"],'r')
				);
				error_log(print_r($parser->VTIMEZONE, true));
			} catch (Exception $e) {
				$error = true;
				$error_msg = $e->getMessage();
			}
			if ($error) {
				$response['status'] = false;
				$response['message'] = $error_msg;
			} else {
				if (count($parser->VEVENT) == 0) {
					$response['status'] = false;
					$response['message'] = "No event in ics file";
				} else {
					$response['status'] = true;
					$response['parsed_file'] = $actionData["ics_filepath"];
					$response['parsed'] = array(
						'events' => $this->parseCalendarToArray($parser),
						'timezone' => isset($parser->VTIMEZONE->TZID) ? (string)$parser->VTIMEZONE->TZID : (string)$parser->{'X-WR-TIMEZONE'},
						'calendar' => (string)$parser->PRODID
					);
				}
			}
		} else {
			$response['status'] = false;
			$response['message'] = "File could not be read by server";
		}

		$this->addActionData($actionType, $response);
		$GLOBALS["bus"]->addData($this->getResponseData());

		if ($this->DEBUG) {
			error_log("parsing done, bus data written!");
		}
	}

	/**
	 * Create a array with contacts
	 *
	 * @param {VObject} $calendar ics parser object
	 * @return array parsed events
	 * @private
	 */
	private function parseCalendarToArray($calendar)
	{
		$events = array();
		foreach ($calendar->VEVENT as $Index => $vEvent) {
			// Sabre\VObject\Parser\XML\Element\VEvent
			$properties = array();

			//uid - used for front/backend communication
			$properties["internal_fields"] = array();
			$properties["internal_fields"]["event_uid"] = base64_encode($Index . $vEvent->UID);

			$properties["startdate"] = (string)$vEvent->DTSTART->getDateTime()->getTimestamp();
			$properties["enddate"] = (string)$vEvent->DTEND->getDateTime()->getTimestamp();
			$properties["location"] = (string)$vEvent->LOCATION;
			$properties["subject"] = (string)$vEvent->SUMMARY;
			$properties["body"] = (string)$vEvent->DESCRIPTION;
			$properties["comment"] = (string)$vEvent->COMMENT;
			$properties["timezone"] = (string)$vEvent->DTSTART["TZID"];
			$properties["organizer"] = (string)$vEvent->ORGANIZER;
			$properties["busy"] = (string)$vEvent->{'X-MICROSOFT-CDO-INTENDEDSTATUS'}; // X-MICROSOFT-CDO-BUSYSTATUS
			$properties["transp"] = (string)$vEvent->TRANSP;
			//$properties["trigger"] = (string)$vEvent->COMMENT;
			$properties["priority"] = (string)$vEvent->PRIORITY;
			$properties["class"] = (string)$vEvent->CLASS;
			//$properties["label"] = (string)$vEvent->COMMENT;
			$properties["lastmodified"] = (string)$vEvent->{'LAST-MODIFIED'};
			$properties["created"] = (string)$vEvent->CREATED;
			$properties["rrule"] = (string)$vEvent->RRULE;

			// Attendees
			$properties["attendees"] = array();
			if(isset($vEvent->ATTENDEE) && count($vEvent->ATTENDEE) > 0) {
				foreach($vEvent->ATTENDEE as $attendee) {
					$properties["attendees"][] = array(
						"name" => (string)$attendee["CN"],
						"mail" => (string)$attendee,
						"status" => (string)$attendee["PARTSTAT"],
						"role" => (string)$attendee["ROLE"]
					);
				}
			}

			// Alarms
			$properties["alarms"] = array();
			if(isset($vEvent->VALARM) && count($vEvent->VALARM) > 0) {
				foreach($vEvent->VALARM as $alarm) {
					$properties["alarms"][] = array(
						"description" => (string)$alarm->DESCRIPTION,
						"trigger" => (string)$alarm->TRIGGER,
						"type" => (string)$alarm->TRIGGER["VALUE"]
					);
				}
			}

			array_push($events, $properties);
		}

		return $events;
	}
}

;

?>
