<?php
/**
 * Parse ics file content to array.
 *
 * PHP Version 5
 *
 * @category Parser
 * @author	 Martin Thoma 
 * @author   Christoph Haas <mail@h44z.net>
 * @modified 17.11.2012 by Christoph Haas (original at http://code.google.com/p/ics-parser/)
 * @license  http://www.opensource.org/licenses/mit-license.php  MIT License
 * @version  SVN: 16
 * @example  $ical = new ical('calendar.ics');
 *           print_r( $ical->events() );
 */

/**
 * This is the iCal-class
 *
 * @param {string} filename The name of the file which should be parsed
 * @constructor
 */
class ICal {
	/* How many ToDos are in this ical? */
	public  /** @type {int} */ $todo_count = 0;

	/* How many events are in this ical? */
	public  /** @type {int} */ $event_count = 0; 

	/* The parsed calendar */
	public /** @type {Array} */ $cal;

	/* Error message store... null default */
	public /** @type {String} */ $errors;

	/* Which keyword has been added to cal at last? */
	private /** @type {string} */ $_lastKeyWord;

	/* The default timezone, used to convert UTC Time */
	private /** @type {string} */ $default_timezone = "Europe/Vienna";

	/** 
	 * Creates the iCal-Object
	 * 
	 * @param {string} $filename The path to the iCal-file
	 *
	 * @return Object The iCal-Object
	 */ 
	public function __construct($filename) {
		if (!$filename) {
			$this->errors = "No filename specified";
			return false;
		}
		
		$lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
		if (stristr($lines[0], 'BEGIN:VCALENDAR') === false) {
			$this->errors = "Not a valid ical file";
			return false;
		} else {
			
			foreach ($lines as $line) {
				$line = trim($line);
				$add  = $this->keyValueFromString($line);
				error_log("line: " . $line);
				if ($add === false) {
					$this->addCalendarComponentWithKeyAndValue($type, false, $line);
					continue;
				} 

				list($keyword, $value) = $add;

				switch ($line) {
				// http://www.kanzaki.com/docs/ical/vtodo.html
				case "BEGIN:VTODO": 
					$this->todo_count++;
					$type = "VTODO"; 
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
				default:
					$this->addCalendarComponentWithKeyAndValue($type, $keyword, $value);
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
	public function addCalendarComponentWithKeyAndValue($component, $keyword, $value) {
		if ($keyword == false) { 
			$keyword = $this->last_keyword; 
			
			switch ($component) {
				case 'VEVENT': 
					if (stristr($keyword, "DTSTART") or stristr($keyword, "DTEND")) {
						$ts = $this->iCalDateToUnixTimestamp($value);
						$value = $ts * 1000;
					}
					$value = str_replace("\\n", "\n", $value); 
					$value = $this->cal[$component][$this->event_count - 1]
												   [$keyword].$value;
					break;
				case 'VTODO' : 
					$value = $this->cal[$component][$this->todo_count - 1]
												   [$keyword].$value;
					break;
			}
		}
		
		//always strip additional content....
		//if (stristr($keyword, "DTSTART") or stristr($keyword, "DTEND")) {
		$keyword = explode(";", $keyword);
		$keyword = $keyword[0];	// remove additional content like VALUE=DATE
		//}
		
		if (stristr($keyword, "TIMEZONE")) {
			$this->default_timezone = $value;	// store the calendertimezone
		}

		switch ($component) { 
			case "VTODO": 
				$this->cal[$component][$this->todo_count - 1][$keyword] = $value;
				//$this->cal[$component][$this->todo_count]['Unix'] = $unixtime;
				break; 
			case "VEVENT": 
				if (stristr($keyword, "DTSTART") or stristr($keyword, "DTEND")) {
					$ts = $this->iCalDateToUnixTimestamp($value);
					$value = $ts * 1000;
				}
				$value = str_replace("\\n", "\n", $value); 
				$this->cal[$component][$this->event_count - 1][$keyword] = $value; 
				break; 
			default: 
				$this->cal[$component][$keyword] = $value; 
				break; 
		} 
		$this->last_keyword = $keyword; 
	}

	/**
	 * Get a key-value pair of a string.
	 *
	 * @param {string} $text which is like "VCALENDAR:Begin" or "LOCATION:"
	 *
	 * @return {array} array("VCALENDAR", "Begin")
	 */
	public function keyValueFromString($text) {
		preg_match("/(^[^a-z:]+[;a-zA-Z=\/\"\']*)[:]([\w\W]*)/", $text, $matches);
		
		error_log("macthes: " . count($matches). " " . $text);
		if (count($matches) == 0) {
			return false;
		}
		
		$matches = array_splice($matches, 1, 2);
		return $matches;
	}

	/** 
	 * Return Unix timestamp from ical date time format 
	 * 
	 * @param {string} $icalDate A Date in the format YYYYMMDD[T]HHMMSS[Z] or
	 *                           YYYYMMDD[T]HHMMSS
	 *
	 * @return {int} 
	 */ 
	public function iCalDateToUnixTimestamp($icalDate) {
	
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
		// Unix timestamps after 03:14:07 UTC 2038-01-19 might cause an overflow
		// if 32 bit integers are used.
		$timestamp = mktime((int)$date[4], 
							(int)$date[5], 
							(int)$date[6], 
							(int)$date[2],
							(int)$date[3], 
							(int)$date[1]);
							
		
		if($utc) {
			$utcdate = new DateTime();
			$utcdate->setTimestamp($timestamp);
			$utcdate->setTimezone(new DateTimeZone($this->default_timezone));
			$utcoffset = $utcdate->getOffset();
		} else {
			$utcoffset = 0;
		}
		
		return  ($timestamp + $utcoffset);
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
				$anEvent['UNIX_TIMESTAMP'] = 
							$this->iCalDateToUnixTimestamp($anEvent['DTSTART']);
			}

			if (!array_key_exists('REAL_DATETIME', $anEvent)) {
				$anEvent['REAL_DATETIME'] = 
							date("d.m.Y", $anEvent['UNIX_TIMESTAMP']);
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
