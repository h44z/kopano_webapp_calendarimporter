<?php
/**
 * functions.php, zarafa calender to ics im/exporter backend
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
 
/* gets the data from a URL */
function curl_get_data($url, $username = NULL, $password = NULL) {
	$ch = curl_init();
	$timeout = 5;
	
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
	
	if($username != NULL && $password != NULL) {
		curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
	}
	
	$data = curl_exec($ch);
	$http_status = intval(curl_getinfo($ch, CURLINFO_HTTP_CODE));
	curl_close($ch);
	
	if($http_status > 210 || $http_status < 200) 
		return NULL;
	return $data;
}

/* gets all zarafa users */
function get_user_ics_list($userStore) {
	// get settings
	// first check if property exist and we can open that using mapi_openproperty
	$storeProps = mapi_getprops($userStore, array(PR_EC_WEBACCESS_SETTINGS_JSON));

	// Check if property exists, if it doesn not exist then we can continue with empty set of settings
	if (isset($storeProps[PR_EC_WEBACCESS_SETTINGS_JSON]) || propIsError(PR_EC_WEBACCESS_SETTINGS_JSON, $storeProps) == MAPI_E_NOT_ENOUGH_MEMORY) {
		// read the settings property
		$stream = mapi_openproperty($userStore, PR_EC_WEBACCESS_SETTINGS_JSON, IID_IStream, 0, 0);
		if ($stream == false) {
			echo "Error opening settings property\n";
		}

		$settings_string = "";
		$stat = mapi_stream_stat($stream);
		mapi_stream_seek($stream, 0, STREAM_SEEK_SET);
		for ($i = 0; $i < $stat['cb']; $i += 1024) {
			$settings_string .= mapi_stream_read($stream, 1024);
		}
		
		if(empty($settings_string)) {
			// property exists but without any content so ignore it and continue with
			// empty set of settings
			return;
		}
		
		$settings = json_decode($settings_string, true);
		if (empty($settings) || empty($settings['settings'])) {
			echo "Error retrieving existing settings\n";
		}
		
		$calcontext = $settings["settings"]["zarafa"]["v1"]["contexts"]["calendar"];
		if(isset($calcontext["icssync"])) {
			foreach($calcontext["icssync"] as $syncitem) {
				echo "Found sync url: " .  $syncitem["icsurl"] . " for calendar: " . $syncitem["calendar"] . "\n";
			}
			
			return $calcontext["icssync"];
		}
		
		return NULL;
	}
}

/* updates the webapp settings */
function update_last_sync_date($userStore, $icsentry) {
	// get settings
	// first check if property exist and we can open that using mapi_openproperty
	$storeProps = mapi_getprops($userStore, array(PR_EC_WEBACCESS_SETTINGS_JSON));

	// Check if property exists, if it doesn not exist then we can continue with empty set of settings
	if (isset($storeProps[PR_EC_WEBACCESS_SETTINGS_JSON]) || propIsError(PR_EC_WEBACCESS_SETTINGS_JSON, $storeProps) == MAPI_E_NOT_ENOUGH_MEMORY) {
		// read the settings property
		$stream = mapi_openpropertytostream($userStore, PR_EC_WEBACCESS_SETTINGS_JSON, MAPI_MODIFY);
		if ($stream == false) {
			echo "Error opening settings property\n";
		}

		$settings_string = "";
		$stat = mapi_stream_stat($stream);
		mapi_stream_seek($stream, 0, STREAM_SEEK_SET);
		for ($i = 0; $i < $stat['cb']; $i += 1024) {
			$settings_string .= mapi_stream_read($stream, 1024);
		}
		
		if(empty($settings_string)) {
			// property exists but without any content so ignore it and continue with
			// empty set of settings
			return;
		}
		
		$settings = json_decode($settings_string, true);
		if (empty($settings) || empty($settings['settings'])) {
			echo "Error retrieving existing settings\n";
		}
		
		$settings["settings"]["zarafa"]["v1"]["contexts"]["calendar"]["icssync"][$icsentry]["lastsync"] = date('Y-m-d H:i:s');
		
		$newsettings = json_encode($settings);
		mapi_stream_setsize($stream, strlen($newsettings));
		mapi_stream_seek($stream, 0, STREAM_SEEK_SET);
		mapi_stream_write($stream, $newsettings);
		$res = mapi_stream_commit ($stream);
		return $res;
	}
	
	return false;
}

/* upload a file */
function upload_ics_to_caldav($filename, $caldavurl, $username, $calendarname, $authuser = NULL, $authpass = NULL) {
	$url = $caldavurl . $username . "/" . rawurlencode($calendarname) . "/";
	$post = array('file'=>'@'.$filename);
	$ch = curl_init();
	
	curl_setopt($ch, CURLOPT_URL,$url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	
	$fp = fopen($filename, 'r');
	curl_setopt($ch, CURLOPT_PUT, true);
	curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
	curl_setopt($ch, CURLOPT_INFILE, $fp);
	curl_setopt($ch, CURLOPT_INFILESIZE, filesize ($filename));   
	
	if($authuser != NULL && $authpass != NULL) {
		curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		curl_setopt($ch, CURLOPT_USERPWD, "$authuser:$authpass");
	}
	
	$result=curl_exec($ch);
	$http_status = intval(curl_getinfo($ch, CURLINFO_HTTP_CODE));
	curl_close($ch);
	
	echo "uploading file to: " . $url . " (" . $http_status . ")\n";
	
	return $http_status;
}
?>