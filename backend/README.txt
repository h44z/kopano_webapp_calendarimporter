Backend setup:

1. Create a Admin User in Zarafa:
zarafa-admin -c adminuser -e admin@domain.com -f "Calendar Sync Admin" -p topsecretpw -a 1

2. Edit the config.php to fit your needs.

3. Setup cron to run your script every 10 minutes (or whatever...)

4. If you get an error, make sure that the mapi module is loaded for php-cli:
 * Add: /etc/php5/cli/conf.d/50-mapi.ini
 * Content: extension=mapi.so

Never run the backend script as root!