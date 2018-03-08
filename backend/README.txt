# Backend setup:

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