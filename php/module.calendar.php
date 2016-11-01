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

	private $busystates = null;

	private $labels = null;

	private $attendeetype = null;

	/**
	 * @constructor
	 * @param $id
	 * @param $data
	 */
	public function __construct($id, $data)
	{
		parent::__construct($id, $data);

		// init default timezone
		date_default_timezone_set(PLUGIN_CALENDARIMPORTER_DEFAULT_TIMEZONE);

		// init mappings
		$this->busystates = array(
			"FREE",
			"TENTATIVE",
			"BUSY",
			"OOF"
		);

		$this->labels = array(
			"NONE",
			"IMPORTANT",
			"WORK",
			"PERSONAL",
			"HOLIDAY",
			"REQUIRED",
			"TRAVEL REQUIRED",
			"PREPARATION REQUIERED",
			"BIRTHDAY",
			"SPECIAL DATE",
			"PHONE INTERVIEW"
		);

		$this->attendeetype = array(
			"NON-PARTICIPANT", // needed as zarafa starts counting at 1
			"REQ-PARTICIPANT",
			"OPT-PARTICIPANT",
			"NON-PARTICIPANT"
		);
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
	 * Get a property from the array.
	 * @param $props
	 * @param $propname
	 * @return string
	 */
	private function getProp($props, $propname)
	{
		if (isset($props["props"][$propname])) {
			return $props["props"][$propname];
		}
		return "";
	}

	private function getDurationStringFromMintues($minutes, $pos = false) {
		$pos = $pos === true ? "+" : "-";
		$str = $pos . "P";



		// variables for holding values
		$mins = intval($minutes);
		$hours = 0;
		$days  = 0;
		$weeks = 0;

		// calculations
		if ( $mins >= 60 ) {
			$hours = (int)($mins / 60);
			$mins = $mins % 60;
		}
		if ( $hours >= 24 ) {
			$days = (int)($hours / 24);
			$hours = $hours % 60;
		}
		if ( $days >= 7 ) {
			$weeks = (int)($days / 7);
			$days = $days % 7;
		}

		// format result
		if ( $weeks ) {
			$str .= "{$weeks}W";
		}
		if ( $days ) {
			$str .= "{$days}D";
		}
		if ( $hours ) {
			$str .= "{$hours}H";
		}
		if ( $mins ) {
			$str .= "{$mins}M";
		}

		return $str;
	}

	/**
	 * The main export function, creates the ics file for download
	 * @param $actionType
	 * @param $actionData
	 */
	private function exportCalendar($actionType, $actionData)
	{
		// Get store id
		$storeid = false;
		if (isset($actionData["storeid"])) {
			$storeid = $actionData["storeid"];
		}

		// Get records
		$records = array();
		if (isset($actionData["records"])) {
			$records = $actionData["records"];
		}

		// Get folders
		$folder = false;
		if (isset($actionData["folder"])) {
			$folder = $actionData["folder"];
		}

		$response = array();
		$error = false;
		$error_msg = "";

		// write csv
		$token = $this->randomstring(16);
		$file = PLUGIN_CALENDARIMPORTER_TMP_UPLOAD . "ics_" . $token . ".ics";
		file_put_contents($file, "");

		$store = $GLOBALS["mapisession"]->openMessageStore(hex2bin($storeid));
		if ($store) {
			// load folder first
			if ($folder !== false) {
				$mapifolder = mapi_msgstore_openentry($store, hex2bin($folder));

				$table = mapi_folder_getcontentstable($mapifolder);
				$list = mapi_table_queryallrows($table, array(PR_ENTRYID));

				foreach ($list as $item) {
					$records[] = bin2hex($item[PR_ENTRYID]);
				}
			}

			$vcalendar = new VObject\Component\VCalendar();

			// Add static stuff to vcalendar
			$vcalendar->add('METHOD', 'PUBLISH');
			$vcalendar->add('X-WR-CALDESC', 'Exported Zarafa Calendar');
			$vcalendar->add('X-WR-TIMEZONE', date_default_timezone_get());

			// TODO: add VTIMEZONE object to ical.

			for ($index = 0, $count = count($records); $index < $count; $index++) {
				$message = mapi_msgstore_openentry($store, hex2bin($records[$index]));

				// get message properties.
				$properties = $GLOBALS['properties']->getAppointmentProperties();
				$plaintext = true;
				$messageProps = $GLOBALS['operations']->getMessageProps($store, $message, $properties, $plaintext);

				$vevent = $vcalendar->add('VEVENT', [
					'SUMMARY' => $this->getProp($messageProps, "subject"),
					'DTSTART' => date_timestamp_set(new DateTime(), $this->getProp($messageProps, "startdate")),
					'DTEND' => date_timestamp_set(new DateTime(), $this->getProp($messageProps, "duedate")),
					'CREATED' => date_timestamp_set(new DateTime(), $this->getProp($messageProps, "creation_time")),
					'LAST-MODIFIED' => date_timestamp_set(new DateTime(), $this->getProp($messageProps, "last_modification_time")),
					'PRIORITY' => $this->getProp($messageProps, "importance"),
					'X-MICROSOFT-CDO-INTENDEDSTATUS' => $this->busystates[intval($this->getProp($messageProps, "busystatus"))], // both seem to be valid...
					'X-MICROSOFT-CDO-BUSYSTATUS' => $this->busystates[intval($this->getProp($messageProps, "busystatus"))], // both seem to be valid...
					'X-ZARAFA-LABEL' => $this->labels[intval($this->getProp($messageProps, "label"))],
					'CLASS' => $this->getProp($messageProps, "private") ? "PRIVATE" : "PUBLIC",
					'COMMENT' => "eid:" . $records[$index]
				]);

				// Add organizer
				$vevent->add('ORGANIZER','mailto:' . $this->getProp($messageProps, "sender_email_address"));
				$vevent->ORGANIZER['CN'] = $this->getProp($messageProps, "sender_name");

				// Add Attendees
				if(isset($messageProps["recipients"]) && count($messageProps["recipients"]["item"]) > 0) {
					foreach($messageProps["recipients"]["item"] as $attendee) {
						$att = $vevent->add('ATTENDEE', "mailto:" . $this->getProp($attendee, "email_address"));
						$att["CN"] = $this->getProp($attendee, "display_name");
						$att["ROLE"] = $this->attendeetype[intval($this->getProp($attendee, "recipient_type"))];
					}
				}

				// Add alarms
				if(!empty($this->getProp($messageProps, "reminder")) && $this->getProp($messageProps, "reminder") == 1) {
					$valarm = $vevent->add('VALARM', [
						'ACTION' => 'DISPLAY',
						'DESCRIPTION' => $this->getProp($messageProps, "subject") // reuse the event summary
					]);

					// Add trigger
					$durationValue = $this->getDurationStringFromMintues($this->getProp($messageProps, "reminder_minutes"), false);
					$valarm->add('TRIGGER', $durationValue); // default trigger type is duration (see 4.8.6.3)

					/*
					$valarm->add('TRIGGER', date_timestamp_set(new DateTime(), $this->getProp($messageProps, "reminder_time"))); // trigger type "DATE-TIME"
					$valarm->TRIGGER['VALUE'] = 'DATE-TIME';
					*/
				}

				// Add location
				if(!empty($this->getProp($messageProps, "location"))) {
					$vevent->add('LOCATION',$this->getProp($messageProps, "location"));
				}

				// Add description
				$body = $this->getProp($messageProps, "isHTML") ? $this->getProp($messageProps, "html_body") : $this->getProp($messageProps, "body");
				if(!empty($body)) {
					$vevent->add('DESCRIPTION',$body);
				}
			}

			// write combined ics file
			file_put_contents($file, file_get_contents($file) . $vcalendar->serialize());
		}

		if (count($records) > 0) {
			$response['status'] = true;
			$response['download_token'] = $token;
			$response['filename'] = count($records) . "events.ics";
		} else {
			$response['status'] = false;
			$response['message'] = "No events found. Export skipped!";
		}

		$this->addActionData($actionType, $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}

	/**
	 * The main import function, parses the uploaded ics file
	 * @param $actionType
	 * @param $actionData
	 */
	private function importCalendar($actionType, $actionData)
	{
		// Get uploaded vcf path
		$icsfile = false;
		if (isset($actionData["ics_filepath"])) {
			$icsfile = $actionData["ics_filepath"];
		}

		// Get store id
		$storeid = false;
		if (isset($actionData["storeid"])) {
			$storeid = $actionData["storeid"];
		}

		// Get folder entryid
		$folderid = false;
		if (isset($actionData["folderid"])) {
			$folderid = $actionData["folderid"];
		}

		// Get uids
		$uids = array();
		if (isset($actionData["uids"])) {
			$uids = $actionData["uids"];
		}

		$response = array();
		$error = false;
		$error_msg = "";

		// parse the ics file a last time...
		$parser = null;
		try {
			$parser = VObject\Reader::read(
				fopen($icsfile,'r')
			);
		} catch (Exception $e) {
			$error = true;
			$error_msg = $e->getMessage();
		}

		$events = array();
		if (count($parser->VEVENT) > 0) {
			$events = $this->parseCalendarToArray($parser);
			$store = $GLOBALS["mapisession"]->openMessageStore(hex2bin($storeid));
			$folder = mapi_msgstore_openentry($store, hex2bin($folderid));

			$importall = false;
			if (count($uids) == count($events)) {
				$importall = true;
			}

			$propValuesMAPI = array();
			$properties = $GLOBALS['properties']->getAppointmentProperties();
			// extend properties...
			$properties["body"] = PR_BODY;

			$count = 0;

			// iterate through all events and import them :)
			foreach ($events as $event) {
				if (isset($event["startdate"]) && ($importall || in_array($event["internal_fields"]["event_uid"], $uids))) {

					$message = mapi_folder_createmessage($folder);

					// parse the arraykeys
					foreach ($event as $key => $value) {
						if ($key !== "internal_fields") {
							if(isset($properties[$key])) {
								$propValuesMAPI[$properties[$key]] = $value;
							}
						}
					}

					$propValuesMAPI[$properties["commonstart"]] = $propValuesMAPI[$properties["startdate"]];
					$propValuesMAPI[$properties["commonend"]] = $propValuesMAPI[$properties["duedate"]];
					$propValuesMAPI[$properties["duration"]] = ($propValuesMAPI[$properties["duedate"]] - $propValuesMAPI[$properties["startdate"]]) / 60; // Minutes needed
					$propValuesMAPI[$properties["reminder"]] = false; // needed, overwritten if there is a timer

					$propValuesMAPI[$properties["message_class"]] = "IPM.Appointment";
					$propValuesMAPI[$properties["icon_index"]] = "1024";

					// TODO: set attendees and alarms

					mapi_setprops($message, $propValuesMAPI);
					mapi_savechanges($message);
					if ($this->DEBUG) {
						error_log("New event added: \"" . $event["subject"] . "\".\n");
					}
					$count++;
				}
			}

			$response['status'] = true;
			$response['count'] = $count;
			$response['message'] = "";

		} else {
			$response['status'] = false;
			$response['count'] = 0;
			$response['message'] = $error ? $error_msg : "ICS file empty!";
		}

		$this->addActionData($actionType, $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
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
				//error_log(print_r($parser->VTIMEZONE, true));
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
			$properties["duedate"] = (string)$vEvent->DTEND->getDateTime()->getTimestamp();
			$properties["location"] = (string)$vEvent->LOCATION;
			$properties["subject"] = (string)$vEvent->SUMMARY;
			$properties["body"] = (string)$vEvent->DESCRIPTION;
			$properties["comment"] = (string)$vEvent->COMMENT;
			$properties["timezone"] = (string)$vEvent->DTSTART["TZID"];
			$properties["organizer"] = (string)$vEvent->ORGANIZER;
			$properties["busystatus"] = array_search((string)$vEvent->{'X-MICROSOFT-CDO-INTENDEDSTATUS'}, $this->busystates); // X-MICROSOFT-CDO-BUSYSTATUS
			$properties["transp"] = (string)$vEvent->TRANSP;
			//$properties["trigger"] = (string)$vEvent->COMMENT;
			$properties["priority"] = (string)$vEvent->PRIORITY;
			$properties["private"] = ((string)$vEvent->CLASS) == "PRIVATE" ? true : false;
			if(!empty((string)$vEvent->{'X-ZARAFA-LABEL'})) {
				$properties["label"] = array_search((string)$vEvent->{'X-ZARAFA-LABEL'}, $this->labels);
			}
			$properties["last_modification_time"] = (string)$vEvent->{'LAST-MODIFIED'}->getDateTime()->getTimestamp();
			$properties["creation_time"] = (string)$vEvent->CREATED->getDateTime()->getTimestamp();
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
