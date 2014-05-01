#!/usr/bin/php
<?php
include('/usr/share/php/mapi/mapi.util.php');
include('/usr/share/php/mapi/mapidefs.php');
include('/usr/share/php/mapi/mapicode.php');
include('/usr/share/php/mapi/mapitags.php');
include('/usr/share/php/mapi/mapiguid.php');

// $serverlocation is optional, default http://localhost:236/zarafa
$session = mapi_logon_zarafa("SYSTEM", "", "file:///var/run/zarafa");
if($session === FALSE) {
	echo "Logon failed with error " .mapi_last_hresult() . "\n";
}
// load the default store
$userstore = null;
$stores = mapi_getmsgstorestable($session);
if($stores === FALSE) {
	echo "Stores not opened with error " .mapi_last_hresult() . "\n";
}
$storeslist = mapi_table_queryallrows($stores, array(PR_ENTRYID, PR_DEFAULT_STORE));
foreach($storeslist as $row) {
	if($row[PR_ENTRYID]){
		if(isset($row[PR_DEFAULT_STORE]) && $row[PR_DEFAULT_STORE] == true) {
			try {
				
				$masterstore = mapi_openmsgstore($session, $row[PR_ENTRYID]);
				$id = mapi_msgstore_createentryid($masterstore, "christoph"); 
				$userstore = mapi_openmsgstore($session, $id);
			} catch (MAPIException $e) {
				echo "OpenMsgStore failed: " . $e->getCode();
				return $e->getCode();
			}
			break;
		}
	}	
}

// get settings
// first check if property exist and we can open that using mapi_openproperty
$storeProps = mapi_getprops($userstore, array(PR_EC_WEBACCESS_SETTINGS_JSON));

// Check if property exists, if it doesn not exist then we can continue with empty set of settings
if (isset($storeProps[PR_EC_WEBACCESS_SETTINGS_JSON]) || propIsError(PR_EC_WEBACCESS_SETTINGS_JSON, $storeProps) == MAPI_E_NOT_ENOUGH_MEMORY) {
	// read the settings property
	$stream = mapi_openproperty($userstore, PR_EC_WEBACCESS_SETTINGS_JSON, IID_IStream, 0, 0);
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
			echo $syncitem["icsurl"] . "<br/>";
		}
	} else {
		echo "no sync items";
	}
}
?>