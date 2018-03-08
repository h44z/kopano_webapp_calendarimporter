CALENDAR IMPORTER AND EXPORTER:
===

## Building the calendar importer plugin from source:

### Dependencies
 - Kopano WebApp Source Code (https://stash.kopano.io/projects/KW/repos/kopano-webapp/browse)
 - PHP >= 5 (7 or higher recommended)
 - composer (https://getcomposer.org/)
 - JDK 1.8 (http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
 - ant (http://ant.apache.org/)

Add JAVA_HOME (e.g. C:\Program Files\Java\jdk1.8.0_161) to your path. Also add Ant, Composer, PHP and Java to the global PATH variable!

### Compiling the plugin
Unzip (or use git clone) the sourcecode of Kopano WebApp to a new directory. In this README we call the source folder of WebApp "kopano-webapp-source".

Then generate the WebApp build utils:
```
cd kopano-webapp-source
ant tools
```

Next clone the plugin to the WebApp plugin directory:
```
cd kopano-webapp-source\plugins
git clone https://git.sprinternet.at/zarafa_webapp/calendarimporter.git
```

Now lets build the plugin:
```
cd kopano-webapp-source\plugins\calendarimporter\php
composer install
cd kopano-webapp-source\plugins\calendarimporter
ant deploy
```

The compiled plugin is saved to `kopano-webapp-source\deploy\plugins\calendarimporter`.

## Installing the plugin

### From compiled source
Copy the whole folder "calendarimporter" to your production WebApp (`kopano-webapp-production\plugins\calendarimporter`)

For example:
```
cp -r kopano-webapp-source\deploy\plugins\calendarimporter kopano-webapp-production\plugins\
```

## Installing the sync backend

### From source
Copy the whole folder "kopano-webapp-source\plugins\calendarimporter\backend" to a destination of cour choice.

For example:
```
cp -r kopano-webapp-source\plugins\calendarimporter\backend /opt/ical-sync/backend
```

### From precompiled download
Download the newest backend release from https://git.sprinternet.at/zarafa_webapp/calendarimporter/tree/master/DIST.

Unzip the downloaded file and copy the backend folder to a destination of cour choice.

For example:
```
cp -r Downloads\calendarimporter_backend /opt/ical-sync/backend
```

## WebApp Plugin Configuration
Edit the config.php file in the plugin root path to fit your needs.

Available configuration values:

| Configuration Value        | Type           | Default  | Desctription |
| ------------- |:-------------:| ----- | ----- |
| PLUGIN_CALENDARIMPORTER_USER_DEFAULT_ENABLE     | boolean | false | Set to true to enable the plugin for all users |
| PLUGIN_CALENDARIMPORTER_USER_DEFAULT_ENABLE_SYNC     | string | true | Set to true to enable the sync feature for all users |
| PLUGIN_CALENDARIMPORTER_DEFAULT     | string | "Kalender" | Default calendar folder name (might be "Calendar" on english installations) |
| PLUGIN_CALENDARIMPORTER_DEFAULT_TIMEZONE     | string | "Europe/Vienna" | The local Timezone |
| PLUGIN_CALENDARIMPORTER_TMP_UPLOAD     | string | "/var/lib/kopano-webapp/tmp/" | Temporary path to store uploaded iCal files |

## Sync Backend Configuration
First you have to create a new Kopano user with admin rights.
For example:
```
kopano-admin -c adminuser -e admin@domain.com -f "Calendar Sync Admin" -p topsecretpw -a 1
```
Then edit the config.php file of the sync backend to fit your needs.

Available configuration values:

| Configuration Value        | Type           | Default  | Desctription |
| ------------- |:-------------:| ----- | ----- |
| $ADMINUSERNAME     | string | "adminuser" | The newly created Kopano admin user |
| $ADMINPASSWORD     | string | "topsecretpw" | The password of the admin user |
| $SERVER     | string | "http://localhost:236/kopano" | Kopano Socket or HTTP(S) connection string |
| $CALDAVURL     | string | "http://localhost:8080/ical/" | Kopano CalDAV URL |
| $TEMPDIR     | string | "/tmp/" | Temporary path to store synchronised iCal files (must be writeable by the user executing the sync script) |

Next set up a cronjob to allow periodic syncing of ical items.

For example: (`/etc/crontab`):
```
# sync ics calendars every minute (interval can be changed by the user)
* * * * * icssync /opt/ical-sync/backend/sync.php > /var/log/icssync.log 2>&1
```

If you get an error, make sure that the mapi module is loaded for php-cli. Therefore create or modify: `/etc/php7/cli/conf.d/50-mapi.ini`
``` 
extension=mapi.so 
```

Do no run the sync script as root! Create a user without admin rights (`adduser icssync`), and change permissions of the tmp folder accordingly.

## Usage

The plugin add context menu entries to calendar folders.

![Plugin Context Menus](https://git.sprinternet.at/zarafa_webapp/calendarimporter/raw/master/usage.png "Kopano Webapp Context Menu")

If syncing is enabled, the calendar section in the WebApp settings gets extended with a synchronisation overview. There you can add new iCal URLs for syncing.

![Plugin Settings Menus](https://git.sprinternet.at/zarafa_webapp/calendarimporter/raw/master/usage_sync.png "Kopano Webapp Settings Menu")