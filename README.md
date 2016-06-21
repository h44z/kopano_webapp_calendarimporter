CALENDAR IMPORTER AND EXPORTER:
===

Building the calendar importer plugin for Zarafa WebApp:

```
cd /zarafa/webapp/
ant tools
cd /zarafa/webapp/plugins/
git clone https://git.sprinternet.at/zarafa_webapp/calendarimporter.git
cd calendarimporter
ant deploy
```

### Usage
Rightclick a calendarfolder or calendar entry to export it as iCal.

Rightclick a calendarfolder to import a iCal file.

Rightclick a iCal attachment to import it.