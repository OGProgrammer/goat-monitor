# GOAT Monitor

Install Node, run npm install to install deps

Copy `example.config.json` over to `config.json` and setup your email smtp information.

Use the command below to scrape goat for a total of how many used shoes there are.

`node screen.js https://goat-url-to-the-used-page-of-your-target-shoe 11`

NOTE: 1st param is the url and 2nd is the desired size to scan for a total.

1st run will collect the total for that size, any run after will send an email if the total changes. Note if you run this too much, you'll get throttled/blocked so try only every 10 minutes or so.

Linux might need the following package for electron to work:

`sudo apt-get install libgconf-2.4`

If your running Windows, delete it and use a real OS.

Good Luck 🐐

## Auto run every X time

### MAC OSX LaunchD Configuration

http://launched.zerowidth.com

### Linux

http://www.cronmaker.com
