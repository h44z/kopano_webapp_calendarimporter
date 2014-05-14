<?php
/**
 * class.icalparser.php zarafa calender to ics im/exporter
 * http://code.google.com/p/ics-parser/
 *
 * Author: Martin Thoma , Christoph Haas <christoph.h@sprinternet.at>
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

/**
 * This is the iCal-class
 * Parse ics file content to array.
 *
 * @param {string} filename The name of the file which should be parsed
 * @constructor
 */
class ICal {
	/* How many ToDos are in this ical? */
	public  /** @type {int} */ $todo_count = 0;

	/* How many events are in this ical? */
	public  /** @type {int} */ $event_count = 0; 
	
	/* Currently editing an alarm? */
	private  /** @type {boolean} */ $isalarm = false; 

	/* The parsed calendar */
	public /** @type {Array} */ $cal;

	/* Error message store... null default */
	public /** @type {String} */ $errors;

	/* Which keyword has been added to cal at last? */
	private /** @type {string} */ $_lastKeyWord;

	/* The default timezone, used to convert UTC Time */
	private /** @type {string} */ $default_timezone = "Europe/Vienna";
	
	/* The default timezone, used to convert UTC Time */
	private /** @type {boolean} */ $timezone_set = false;
	
	/* Ignore Daylight Saving Time */
	private /** @type {boolean} */ $ignore_dst = false;
	
	/** 
	 * Creates the iCal-Object
	 * 
	 * @param {string} $filename The path to the iCal-file
	 *
	 * @return Object The iCal-Object
	 */ 
	public function __construct($filename, $default_timezone, $timezone = false, $igndst = false) {
		if (!$filename) {
			$this->errors = "No filename specified";
			return false;
		}
		
		$this->default_timezone = $default_timezone;
		
		if(isset($timezone) && $timezone != false) {
			$this->default_timezone = $timezone;
			$this->timezone_set = true;
		}
		
		if(isset($igndst) && $igndst != false) {
			$this->ignore_dst = true;
		}
		
		$lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
		if (stristr($lines[0], 'BEGIN:VCALENDAR') === false) {
			$this->errors = "Not a valid ical file";
			return false;
		} else {
			
			foreach ($lines as $line) {
				$line = trim($line);
				$add  = $this->keyValueFromString($line);
				if ($add === false) {
					$this->addCalendarComponentWithKeyAndValue($type, false, $line);
					continue;
				} 

				list($keyword, $dummy, $prop, $propvalue, $value) = $add;

				switch ($line) {
					// http://www.kanzaki.com/docs/ical/vtodo.html
					case "BEGIN:VTODO": 
						$this->todo_count++;
						$type = "VTODO"; 
						break; 
						
					case "BEGIN:VALARM":
						//echo "vevent gematcht";
						$this->isalarm=true;
						$type = "VEVENT"; 
						break;
					// http://www.kanzaki.com/docs/ical/vevent.html
					case "BEGIN:VEVENT": 
						//echo "vevent gematcht";
						$this->event_count++;
						$type = "VEVENT"; 
						break; 

					//all other special strings
					case "BEGIN:VCALENDAR": 
					case "BEGIN:DAYLIGHT": 
						// http://www.kanzaki.com/docs/ical/vtimezone.html
					case "BEGIN:VTIMEZONE": 
					case "BEGIN:STANDARD": 
						$type = $value;
						break; 
					case "END:VTODO": // end special text - goto VCALENDAR key 
					case "END:VEVENT":
					case "END:VCALENDAR": 
					case "END:DAYLIGHT": 
					case "END:VTIMEZONE": 
					case "END:STANDARD": 
						$type = "VCALENDAR"; 
						break;					 
					case "END:VALARM":
						$this->isalarm=false;
						$type = "VEVENT"; 
						break;	
					default:
						$this->addCalendarComponentWithKeyAndValue($type, $keyword, $value, $prop, $propvalue);
						break; 
				} 
			}
			return $this->cal; 
		}
	}

	/** 
	 * Add to $this->ical array one value and key.
	 * 
	 * @param {string} $component This could be VTODO, VEVENT, VCALENDAR, ... 
	 * @param {string} $keyword   The keyword, for example DTSTART
	 * @param {string} $value     The value, for example 20110105T090000Z
	 *
	 * @return {None}
	 */ 
	public function addCalendarComponentWithKeyAndValue($component, $keyword, $value, $prop = false, $propvalue = false) {
		if ($keyword == false) { // multiline value
			$keyword = $this->last_keyword; 
			
			switch ($component) {
				case 'VEVENT': 
					if (stristr($keyword, "DTSTART") or stristr($keyword, "DTEND") or stristr($keyword, "TRIGGER")) {
						$ts = $this->iCalDateToUnixTimestamp($value, $prop, $propvalue);
						$value = $ts * 1000;
					}					
					$value = str_replace("\\n", "\n", $value);				
					
					$value = $this->customFilters($keyword, $value);
					
					if(!$this->isalarm) {
						$value = $this->cal[$component][$this->event_count - 1][$keyword].$value;
					} else {
						$value = $this->cal[$component][$this->event_count - 1]["VALARM"][$keyword].$value;
					}
					break;
				case 'VTODO' : 
					$value = $this->cal[$component][$this->todo_count - 1]
												   [$keyword].$value;
					break;
			}
		}
		
		/* This should not be neccesary anymore*/
		//always strip additional content....
		//if (stristr($keyword, "DTSTART") or stristr($keyword, "DTEND")) {
		//$keyword = explode(";", $keyword);
		//$keyword = $keyword[0];	// remove additional content like VALUE=DATE
		//}
		
		if ((stristr($keyword, "TIMEZONE") || stristr($keyword, "TZID")) && !$this->timezone_set) { // check if timezone already set...
			$this->default_timezone = $this->trimTimeZone($value);	// store the calendertimezone
		}

		switch ($component) { 
			case "VTODO": 
				$this->cal[$component][$this->todo_count - 1][$keyword] = $value;
				//$this->cal[$component][$this->todo_count]['Unix'] = $unixtime;
				break; 
			case "VEVENT": 
				if (stristr($keyword, "DTSTART") or stristr($keyword, "DTEND") or stristr($keyword, "TRIGGER")) {
					$ts = $this->iCalDateToUnixTimestamp($value, $prop, $propvalue);
					$value = $ts * 1000;
				}
				$value = str_replace("\\n", "\n", $value); 
				
				$value = $this->customFilters($keyword, $value);
				
				if(!$this->isalarm) {
					$this->cal[$component][$this->event_count - 1][$keyword] = $value;
				} else {
					$this->cal[$component][$this->event_count - 1]["VALARM"][$keyword] = $value;
				}
				break; 
			default:
				$this->cal[$component][$keyword] = $value; 
				break; 
		} 
		$this->last_keyword = $keyword; 
	}

	/**
	 * Filter some chars out of the value.
	 *
	 * @param {string} $keyword keyword to which the filter is applied
	 * @param {string} $value to filter
	 * @return {string} filtered value
	 */
	private function customFilters($keyword, $value) {
		if (stristr($keyword, "SUMMARY")) {
			$value = str_replace("\n", " ", $value); // we don't need linebreaks in the summary...
		}
		
		if (stristr($keyword, "SUMMARY")) {
			$value = str_replace("\,", ",", $value); // strange escaped comma
		}
		
		return $value;
	}
	
	/**
	 * Trim a Timezone String
	 *
	 * @param {string} $timezone timezone string which should be trimmed
	 * @return {string} trimmed value
	 */
	private function trimTimeZone($timezone) {
		if(preg_match('~([?<=/]*)([^/]*[/|-][^/]*$)~', $timezone, $matches)) { // detects tzurls in tzids			
			if ($matches[2] != "") {
				return $matches[2]; // 2 = extracted timezone
			} else {
				return $timezone;
			}
		}
		
		return $timezone;
	}
	
	/**
	 * Get a key-value pair of a string.
	 *
	 * @param {string} $text which is like "VCALENDAR:Begin" or "LOCATION:"
	 *
	 * @return {array} array("Argument", "Optional Arg/Val", "Optional Arg", "Optional Value", "Value")
	 */
	public function keyValueFromString($text) {
		
		preg_match('/(^[^a-z:;]+)([;]+([a-zA-Z]*)[=]*([^:"]*|"[\w\W]*"))?[:]([\w\W]*)/', $text, $matches);
		
		// this regex has problems with multiple attributes... ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT:mailto:jsmith@example.com
		// TODO: fix this
		
		if (count($matches) == 0) {
			return false;
		}
		
		$matches = array_splice($matches, 1, 5); // 0 = Arg, 1 = Complete Optional Arg/Val, 2 = Optional Arg, 3 = Optional Val, 4 = Value
		return $matches;
	}

	/** 
	 * Return UTC Unix timestamp from ical date time format 
	 * 
	 * @param {string} $icalDate A Date in the format YYYYMMDD[T]HHMMSS[Z] or
	 *                           YYYYMMDD[T]HHMMSS
	 *
	 * @return {int} 
	 */ 
	private function iCalDateToUTCUnixTimestamp($icalDate, $prop, $propvalue) {
	
		$timezone = false;
		$allday = false;
		
		if($prop) {
			$pos = strpos("TZIDtzid", $prop);
			if($pos !== false && $propvalue != false) {
				$timezone = str_replace('"', '', $propvalue);
				$timezone = str_replace('\'', '', $timezone);
				$timezone = $this->trimTimeZone($timezone);
			}
		}
		
		/* timestring format */
		$utc = strpos("zZ",substr($icalDate, -1)) === false ? false : true;
		
		$icalDate = str_replace('T', '', $icalDate); 
		$icalDate = str_replace('Z', '', $icalDate); 

		$pattern  = '/([0-9]{4})';   // 1: YYYY
		$pattern .= '([0-9]{2})';    // 2: MM
		$pattern .= '([0-9]{2})';    // 3: DD
		$pattern .= '([0-9]{0,2})';  // 4: HH
		$pattern .= '([0-9]{0,2})';  // 5: MM
		$pattern .= '([0-9]{0,2})/'; // 6: SS
		preg_match($pattern, $icalDate, $date);

		// Unix timestamp can't represent dates before 1970
		if ($date[1] <= 1970) {
			return false;
		}
		
		// check if we have a allday event
		if((!$date[6] || $date[6] === "") || (!$date[5] || $date[5] === "") || (!$date[4] || $date[4] === "")) {
			$date[6] = 0;
			$date[5] = 0;
			$date[4] = 0;
			$allday = true;
			
			$dtz = date_default_timezone_get();
			date_default_timezone_set('UTC');
		}
		
		// Unix timestamps after 03:14:07 UTC 2038-01-19 might cause an overflow
		// if 32 bit integers are used.
		$timestamp = mktime((int)$date[4], 
							(int)$date[5], 
							(int)$date[6], 
							(int)$date[2],
							(int)$date[3], 
							(int)$date[1]);
							
		if($allday) {
			date_default_timezone_set($dtz);
		}
		
		if(!$utc && !$allday) {
			$tz = $this->default_timezone;
			if($timezone != false) {
				$tz = $timezone;
			}
			
			$error = false;
			$this_tz = false;
			
			try {
				$this_tz = new DateTimeZone($tz);
			} catch(Exception $e) {
				error_log($e->getMessage());
				$error = true;
			}
			
			if($error) {
				try {	// Try using the default calendar timezone
					$this_tz = new DateTimeZone($this->default_timezone);
				} catch(Exception $e) {
					error_log($e->getMessage());
					$timestamp_utc = $timestamp; // if that fails, we cannot do anymore
				}
			}
			
			if($this_tz != false) {
				$tz_now = new DateTime("now", $this_tz);
				$tz_offset = $this_tz->getOffset($tz_now);
				$timestamp_utc = $timestamp - $tz_offset;
			}
		} else {
			$timestamp_utc = $timestamp;
		}
		
		return  array($timestamp_utc,$allday);
	} 

	/**
	 * Return a timezone specific timestamp
	 * @param {int} $timestamp_utc UTC Timestamp to convert
	 * @param {string} $timezone Timezone
	 * @return {int}
	 */
	private function UTCTimestampToTZTimestamp($timestamp_utc, $timezone, $ignore_dst = false) {
		$this_tz = false;
		try {	// Try using the default calendar timezone
			$this_tz = new DateTimeZone($this->default_timezone);
		} catch(Exception $e) {
			error_log($e->getMessage());
			$timestamp_utc = $timestamp; // if that fails, we cannot do anymore
		}
		if($this_tz != false) {
			$transition = $this_tz->getTransitions($timestamp_utc,$timestamp_utc);
			$trans_offset = $transition[0]['offset']; 
			$isdst = $transition[0]['isdst'];	
			
			$tz_now = new DateTime("now", $this_tz);
			$tz_offset = $this_tz->getOffset($tz_now);
			
			if(!$ignore_dst) {
				$tz_offset = $trans_offset;	// normaly use dst
			}
			
			return $timestamp_utc + $tz_offset;
		}
		return $timestamp_utc;	// maybe timezone conversion will fail...
	}
	
	/** 
	 * Return Timezone specific Unix timestamp from ical date time format 
	 * 
	 * @param {string} $icalDate A Date in the format YYYYMMDD[T]HHMMSS[Z] or
	 *                           YYYYMMDD[T]HHMMSS
	 *
	 * @return {int} 
	 */ 
	public function iCalDateToUnixTimestamp($icalDate, $prop, $propvalue) {
		list($timestamp, $allday) = $this->iCalDateToUTCUnixTimestamp($icalDate, $prop, $propvalue);
				
		if(!$allday) {
			$timestamp = $this->UTCTimestampToTZTimestamp($timestamp, $this->default_timezone, $this->ignore_dst, $allday);
		}
		
		return $timestamp;
	}
	
	/**
	 * Returns an array of arrays with all events. Every event is an associative
	 * array and each property is an element it.
	 *
	 * @return {array}
	 */
	public function events() {
		$array = $this->cal;
		return $array['VEVENT'];
	}

	/**
	 * Returns an array of calendar types.
	 *
	 * @return {array}
	 */
	public function calendar() {
		$array = $this->cal;
		return $array['VCALENDAR'];
	}
	
	/**
	 * Returns the default or set timezone
	 *
	 * @return {string}
	 */
	public function timezone() {
		return $this->default_timezone;
	}

	/**
	 * Returns a boolean value whether thr current calendar has events or not
	 *
	 * @return {boolean}
	 */
	public function hasEvents() {
		return ( count($this->events()) > 0 ? true : false );
	}

	/**
	 * Returns false when the current calendar has no events in range, else the
	 * events.
	 * 
	 * Note that this function makes use of a UNIX timestamp. This might be a 
	 * problem on January the 29th, 2038.
	 * See http://en.wikipedia.org/wiki/Unix_time#Representing_the_number
	 *
	 * @param {boolean} $rangeStart Either true or false
	 * @param {boolean} $rangeEnd   Either true or false
	 *
	 * @return {mixed}
	 */
	public function eventsFromRange($rangeStart = false, $rangeEnd = false) {
		$events = $this->sortEventsWithOrder($this->events(), SORT_ASC);

		if (!$events) {
			return false;
		}

		$extendedEvents = array();
		
		if ($rangeStart !== false) {
			$rangeStart = new DateTime();
		}

		if ($rangeEnd !== false or $rangeEnd <= 0) {
			$rangeEnd = new DateTime('2038/01/18');
		} else {
			$rangeEnd = new DateTime($rangeEnd);
		}

		$rangeStart = $rangeStart->format('U');
		$rangeEnd   = $rangeEnd->format('U');

		

		// loop through all events by adding two new elements
		foreach ($events as $anEvent) {
			$timestamp = $this->iCalDateToUnixTimestamp($anEvent['DTSTART']);
			if ($timestamp >= $rangeStart && $timestamp <= $rangeEnd) {
				$extendedEvents[] = $anEvent;
			}
		}

		return $extendedEvents;
	}

	/**
	 * Returns sorted events
	 *
	 * @param {array} $events    An array with events.
	 * @param {array} $sortOrder Either SORT_ASC, SORT_DESC, SORT_REGULAR, 
	 *                           SORT_NUMERIC, SORT_STRING
	 *
	 * @return {array}
	 */
	public function sortEventsWithOrder($events, $sortOrder = SORT_ASC) {
		$extendedEvents = array();
		
		// loop through all events by adding two new elements
		foreach ($events as $anEvent) {
			if (!array_key_exists('UNIX_TIMESTAMP', $anEvent)) {
				$anEvent['UNIX_TIMESTAMP'] = $this->iCalDateToUnixTimestamp($anEvent['DTSTART']);
			}

			if (!array_key_exists('REAL_DATETIME', $anEvent)) {
				$anEvent['REAL_DATETIME'] = date("d.m.Y", $anEvent['UNIX_TIMESTAMP']);
			}
			
			$extendedEvents[] = $anEvent;
		}
		
		foreach ($extendedEvents as $key => $value) {
			$timestamp[$key] = $value['UNIX_TIMESTAMP'];
		}
		array_multisort($timestamp, $sortOrder, $extendedEvents);

		return $extendedEvents;
	}
} 
?>
