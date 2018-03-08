#!/usr/bin/php
<?php
/**
 * sync.php, Kopano calender to ics im/exporter backend
 *
 * Author: Christoph Haas <christoph.h@sprinternet.at>
 * Copyright (C) 2012-2018 Christoph Haas
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
if(php_sapi_name() !== 'cli') {
	die("Script must be run from commandline!");
}

/**
 * Make sure that the kopano mapi extension is enabled in cli mode:
 * Add: /etc/php5/cli/conf.d/50-mapi.ini
 * Content: extension=mapi.so
 */

// MAPI includes
include('mapi/mapi.util.php');
include('mapi/mapidefs.php');
include('mapi/mapicode.php');
include('mapi/mapitags.php');
include('mapi/mapiguid.php');
include('config.php');
include('functions.php');

// log in to zarafa
$session = mapi_logon_zarafa($ADMINUSERNAME, $ADMINPASSWORD, $SERVER);
if($session === FALSE) {
	exit("Logon failed with error " .mapi_last_hresult() . "\n");
}

// load all stores for the admin user
$storeTable = mapi_getmsgstorestable($session);
if($storeTable === FALSE) {
	exit("Storetable could not be opened. Error " .mapi_last_hresult() . "\n");
}
$storesList = mapi_table_queryallrows($storeTable, array(PR_ENTRYID, PR_DEFAULT_STORE));

// get admin users default store
foreach ($storesList as $row) {
	if($row[PR_DEFAULT_STORE]) {
		$storeEntryid = $row[PR_ENTRYID];
	}
}
if(!$storeEntryid) {
	exit("Can't find default store\n");
}

// open default store
$store = mapi_openmsgstore($session, $storeEntryid);
if(!$store) {
	exit("Unable to open system store\n");
}

// get a userlist
$userList = array();
// for multi company setup
$companyList = mapi_zarafa_getcompanylist($store);
if(mapi_last_hresult() == NOERROR && is_array($companyList)) {
	// multi company setup, get all users from all companies
	foreach($companyList as $companyName => $companyData) {
		$userList = array_merge($userList, mapi_zarafa_getuserlist($store, $companyData["companyid"]));
	}
} else {
	// single company setup, get list of all zarafa users
	$userList = mapi_zarafa_getuserlist($store);
}
if(count($userList) <= 0) {
	exit("Unable to get user list\n");
}

// loop over all users
foreach($userList as $userName => $userData) {
	// check for valid users
	if($userName == "SYSTEM" ||$userName == $ADMINUSERNAME) {
		continue;
	}
	
	echo "###Getting sync settings for user: " . $userName . "\n";
	
	$userEntryId = mapi_msgstore_createentryid($store, $userName); 
	$userStore = mapi_openmsgstore($session, $userEntryId);
	if(!$userStore) {
		echo "Can't open user store\n";
		continue;
	}
	
	$syncItems = get_user_ics_list($userStore);
	
	if($syncItems != NULL && count($syncItems) > 0) {
		foreach($syncItems as $syncItemName => $syncItem) {
			//check update intervall
			$lastUpdate = strtotime($syncItem["lastsync"]);
			$updateIntervall = intval($syncItem["intervall"]) * 60; // we need seconds
			$currenttime = time();
			
			if(($lastUpdate + $updateIntervall) <= $currenttime) {
				echo "Update intervall OK ($currenttime): " . ($lastUpdate + $updateIntervall) . "\n";
				
				$tmpFilename = $TEMPDIR . uniqid($userName . $syncItem["calendar"], true) . ".ics";
				
				$user = NULL;
				$pass= NULL;
				
				if($syncItem["user"] != NULL && !empty($syncItem["user"]))
					$user = $syncItem["user"];
				if($syncItem["pass"] != NULL && !empty($syncItem["pass"]))
					$pass= base64_decode($syncItem["pass"]);	
					
				$icsData = curl_get_data($syncItem["icsurl"], $user, $pass);
				
				if($icsData != NULL) {
					file_put_contents($tmpFilename, $icsData);
					echo "Got valid data for " . $syncItem["icsurl"] . " stored in " . $tmpFilename . "\n";
					$result = upload_ics_to_caldav($tmpFilename, $CALDAVURL, $userName, $syncItem["calendarname"], $ADMINUSERNAME, $ADMINPASSWORD);
					if(intval($result) == 200) {
						echo "Import completed: $result\n";
						$result = update_last_sync_date($userStore, $syncItemName);
						$res = $result ? "true":"false";
						echo "Updated Kopano settings: " . $res . "\n";
					} else {
						echo "Uploading failed: " . $result . "\n";
					}
				}
			} else {
				echo "Update intervall STOP ($currenttime): " . ($lastUpdate + $updateIntervall) . "\n";
			}
		}
	}
	
	echo "###Done sync for user: " . $userName . "\n\n";
}