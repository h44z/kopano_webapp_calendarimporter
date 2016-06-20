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
	 * Generates the secid file (used to verify the download path)
	 * @param $time a timestamp
	 * @param $incl_time true if date should include time
	 * @ return date object
	 */
	private function getIcalDate($time, $incl_time = true)
	{
		return $incl_time ? date('Ymd\THis', $time) : date('Ymd', $time);
	}

	/**
	 * adds an event to the exported calendar)
	 * @param $vevent pointer to the eventstore
	 * @param $event the event to add
	 */
	private function addEvent(&$vevent, $event)
	{

		$busystate = array("FREE", "TENTATIVE", "BUSY", "OOF");
		$zlabel = array("NONE", "IMPORTANT", "WORK", "PERSONAL", "HOLIDAY", "REQUIRED", "TRAVEL REQUIRED", "PREPARATION REQUIERED", "BIRTHDAY", "SPECIAL DATE", "PHONE INTERVIEW");

		$vevent->setProperty("LOCATION", $event["location"]);       // property name - case independent
		$vevent->setProperty("SUMMARY", $event["subject"]);
		$vevent->setProperty("DESCRIPTION", str_replace("\n", "\\n", $event["description"]));
		$vevent->setProperty("COMMENT", "Exported from Zarafa");
		$vevent->setProperty("ORGANIZER", $event["sent_representing_email_address"]);
		$vevent->setProperty("DTSTART", $this->getIcalDate($event["commonstart"]) . "Z");
		$vevent->setProperty("DTEND", $this->getIcalDate($event["commonend"]) . "Z");
		$vevent->setProperty("DTSTAMP", $this->getIcalDate($event["creation_time"]) . "Z");
		$vevent->setProperty("CREATED", $this->getIcalDate($event["creation_time"]) . "Z");
		$vevent->setProperty("LAST-MODIFIED", $this->getIcalDate($event["last_modification_time"]) . "Z");
		$vevent->setProperty("X-MICROSOFT-CDO-BUSYSTATUS", $busystate[$event["busystatus"]]);
		$vevent->setProperty("X-ZARAFA-LABEL", $zlabel[$event["label"]]);
		$vevent->setProperty("PRIORITY", $event["importance"]);
		$vevent->setProperty("CLASS", $event["private"] ? "PRIVATE" : "PUBLIC");

		// ATTENDEES
		if (count($event["attendees"]) > 0) {
			foreach ($event["attendees"] as $attendee) {
				$vevent->setProperty("ATTENDEE", $attendee["props"]["smtp_address"]);
			}
		}

		// REMINDERS
		if ($event["reminder"]) {
			$valarm = &$vevent->newComponent("valarm");    // create an event alarm
			$valarm->setProperty("action", "DISPLAY");
			$valarm->setProperty("description", $vevent->getProperty("SUMMARY"));    // reuse the event summary
			$valarm->setProperty("trigger", $this->getIcalDate($event["reminder_time"]) . "Z");    // create alarm trigger (in UTC datetime)
		}
	}

	/**
	 * Loads the descriptiontext of an event
	 * @param $event
	 * @return array with event description/body
	 */
	private function loadEventDescription($event)
	{
		$entryid = $this->getActionEntryID($event);
		$store = $this->getActionStore($event);

		$basedate = null;

		$properties = $GLOBALS['properties']->getAppointmentProperties();
		$plaintext = true;

		$data = array();

		if ($store && $entryid) {
			$message = $GLOBALS['operations']->openMessage($store, $entryid);


			// add all standard properties from the series/normal message 
			$data['item'] = $GLOBALS['operations']->getMessageProps($store, $message, $properties, (isset($plaintext) && $plaintext));

			// if appointment is recurring then only we should get properties of occurence if basedate is supplied
			if ($data['item']['props']['recurring'] === true) {
				if (isset($basedate) && $basedate) {
					$recur = new Recurrence($store, $message);

					$exceptionatt = $recur->getExceptionAttachment($basedate);

					// Single occurences are never recurring
					$data['item']['props']['recurring'] = false;

					if ($exceptionatt) {
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
							if (!empty($exceptionProps['props']['body'])) {
								$data['item']['props']['body'] = $exceptionProps['props']['body'];
							}

							if (!empty($exceptionProps['props']['html_body'])) {
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
					if (isset($recurpattern) && is_array($recurpattern)) {
						$data['item']['props'] += $recurpattern;
					}

					// Add the timezone information to the data
					if (isset($tz) && is_array($tz)) {
						$data['item']['props'] += $tz;
					}
				}
			}
		}

		return $data['item']['props']['body'];
	}

	/**
	 * Loads the attendees of an event
	 * @param $event
	 * @return array with event attendees
	 */
	private function loadAttendees($event)
	{
		$entryid = $this->getActionEntryID($event);
		$store = $this->getActionStore($event);

		$basedate = null;

		$properties = $GLOBALS['properties']->getAppointmentProperties();
		$plaintext = true;

		$data = array();

		if ($store && $entryid) {
			$message = $GLOBALS['operations']->openMessage($store, $entryid);


			// add all standard properties from the series/normal message 
			$data['item'] = $GLOBALS['operations']->getMessageProps($store, $message, $properties, (isset($plaintext) && $plaintext));

		}

		return $data['item']['recipients']['item'];
	}

	/**
	 * The main export function, creates the ics file for download
	 * @param $actionType
	 * @param $actionData
	 */
	private function exportCalendar($actionType, $actionData)
	{
		$secid = $this->randomstring();
		$this->createSecIDFile($secid);
		$tmpname = stripslashes($actionData["calendar"] . ".ics." . $this->randomstring(8));
		$filename = TMP_PATH . "/" . $tmpname . "." . $secid;

		if (!is_writable(TMP_PATH . "/")) {
			error_log("could not write to export tmp directory!");
		}

		$tz = date("e");    // use php timezone (maybe set up in php.ini, date.timezone)

		if ($this->DEBUG) {
			error_log("PHP Timezone: " . $tz);
		}

		$config = array(
			"language" => substr($GLOBALS["settings"]->get("zarafa/v1/main/language"), 0, 2),
			"directory" => TMP_PATH . "/",
			"filename" => $tmpname . "." . $secid,
			"unique_id" => "zarafa-export-plugin",
			"TZID" => $tz
		);

		$v = new vcalendar($config);
		$v->setProperty("method", "PUBLISH");                            // required of some calendar software
		$v->setProperty("x-wr-calname", $actionData["calendar"]);        // required of some calendar software
		$v->setProperty("X-WR-CALDESC", "Exported Zarafa Calendar");    // required of some calendar software
		$v->setProperty("X-WR-TIMEZONE", $tz);

		$xprops = array("X-LIC-LOCATION" => $tz);                    // required of some calendar software
		iCalUtilityFunctions::createTimezone($v, $tz, $xprops);        // create timezone object in calendar


		foreach ($actionData["data"] as $event) {
			$event["props"]["description"] = $this->loadEventDescription($event);
			$event["props"]["attendees"] = $this->loadAttendees($event);

			$vevent = &$v->newComponent("vevent");    // create a new event object
			$this->addEvent($vevent, $event["props"]);
		}

		$v->saveCalendar();

		$response['status'] = true;
		$response['fileid'] = $tmpname;    // number of entries that will be exported
		$response['basedir'] = TMP_PATH;
		$response['secid'] = $secid;
		$response['realname'] = $actionData["calendar"];
		$this->addActionData($actionType, $response);
		$GLOBALS["bus"]->addData($this->getResponseData());

		if ($this->DEBUG) {
			error_log("export done, bus data written!");
		}
	}

	/**
	 * The main import function, parses the uploaded ics file
	 * @param $actionType
	 * @param $actionData
	 */
	private function importCalendar($actionType, $actionData)
	{
		if ($this->DEBUG) {
			error_log("PHP Timezone: " . $tz);
		}

		if (is_readable($actionData["ics_filepath"])) {
			$ical = new ICal($actionData["ics_filepath"], $GLOBALS["settings"]->get("zarafa/v1/plugins/calendarimporter/default_timezone"), $actionData["timezone"], $actionData["ignore_dst"]); // Parse it!

			if (isset($ical->errors)) {
				$response['status'] = false;
				$response['message'] = $ical->errors;
			} else {
				if (!$ical->hasEvents()) {
					$response['status'] = false;
					$response['message'] = "No events in ics file";
				} else {
					$response['status'] = true;
					$response['parsed_file'] = $actionData["ics_filepath"];
					$response['parsed'] = array(
						'timezone' => $ical->timezone(),
						'calendar' => $ical->calendar(),
						'events' => $ical->events()
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
				$parser = new vcalendar([
					"unique_id" => md5($actionData["ics_filepath"]),
					"filename" => $actionData["ics_filepath"]
				]);
				$parser->parse();
			} catch (Exception $e) {
				$error = true;
				$error_msg = $e->getMessage();
			}
			if ($error) {
				$response['status'] = false;
				$response['message'] = $error_msg;
			} else {
				if (iterator_count($parser) == 0) {
					$response['status'] = false;
					$response['message'] = "No event in ics file";
				} else {
					$response['status'] = true;
					$response['parsed_file'] = $actionData["ics_filepath"];
					$response['parsed'] = array(
						'contacts' => $this->parseCalendarToArray($parser)
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
	 * @param calendar ics parser object
	 * @return array parsed events
	 * @private
	 */
	private function parseCalendarToArray($calendar)
	{
		return false;
	}
}

;

?>
