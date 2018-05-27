# weewx-calduino

WeeWX extension to collect, import and display data from Buderus / Nefit / Worcester (or any other EMS Bus compatible) boilers. It also includes a control panel to manage the most important configurations of the boiler.

## Instalation
Install as any other weeWX extension:

 1. Download tarball from Github:
`wget https://github.com/danimaciasperea/weewx-calduino/archive/VX.Y.tar.gz`

 2. Run the extension installer:
	`wee_extension --install weewx-calduino-x.y.tgz` 

 3. Update, if required, the **weewx.conf** and include the location of the XML files to import in [Calduino] section. If desired, change the sqlite configuration for mysql databases.
 4. The tarball file contains an example of service to obtain from the boiler periodically its status in XML format. WeeWX's extensions installer will have uncompressed it in `/tmp` or `/var/tmp`. It is located in `pollCalduino` folder. Adapt the script to your needs. Probably you will need to include the IP of your Calduino device in `\etc\hosts`. If you want to use IFTTT notifications, you will have to include your key.
 5. Once everything is in place, restart weewx.
	 `sudo service weewx stop`
	 `sudo service weewx start`

## Usage

In the first run WeeWX will create a new database named calduino.sdb. Edit the template files to include graphics and or gauges of your boiler's current status. The file `calduinoControlPanel.html.tmpl` contains an AJAX form/panel that interacts synchronously with the [Calduino](https://github.com/danimaciasperea/Calduino) device connected to the EMS Bus. It has been designed using Bootstrap. Javascript is used for calculations and user interaction. In the server side, a PHP file `calduinoWrapper.php.tmpl` performs directly the communication with Calduino using `libcurl` library.
 
More help can be found in my [blog](https://domoticproject.com/integrating-calduino-weewx-extension/).

Disclaimer: Note that the code is highly tailored to my environment and needs. It is probable that in different OS (I use Raspbian) you will have to do changes to make it work.

## Example
 
![Weewx Calduino Full Screen](https://domoticproject.com/wp-content/uploads/2018/05/weeWXCalduinoFullScreen.jpg)

## License

This project is licensed under the MIT License - see the  [license file](https://github.com/danimaciasperea/weewx-calduino/blob/master/LICENSE.md)  for details

## Legal Notice

Legal Notices Bosch Group, Buderus, Nefit and Worcester are brands of Bosch Thermotechnology. All other trademarks are the property of their respective owners.