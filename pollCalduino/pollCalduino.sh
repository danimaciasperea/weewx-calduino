#/bin/bash

# variables

loopWaitTime=300

userIFTTTKey=

iPCamWrapperPath=/var/www/html/home/iPCamWrapper.php
calduinoWrapperPath=/var/www/html/calduino/calduinoWrapper.php
RFWrapperPath=/var/www/html/home/RFWrapper.php
pollMonitorXMLPath=/var/www/html/calduino/pollMonitor.xml

lastAlarmCamTime=$(date +%s)
secondsWaitAlarm=900
todayAlarms=0
today=$(( $(date -d $(date +%D) +%s) / 86400 ))
maxDriftAllowed=5
opOKPoll=0
opNOKPoll=0
totalOP=0
minuteEnd=3
tag="pollCalduino"
opMeanTimePoll=0

# Get Absolute value
function abs() {
	[ $1 -lt 0 ] && echo $((-$1)) || echo $1
}

# Update General Monitor XML file. In case of error, send an IFTTT notification
function updateGeneralMonitor() {
	
	logger -t $tag "Trying to update General Monitor."
	startTime=$(date +%s)	
	
	php -f $calduinoWrapperPath 'parameter=getGeneralMonitor'
	phpReturnValue=$?	
	
	endTime=$(date +%s)
	opLastTimePoll=$((endTime-startTime))	
	((totalOP++))
		
	if [ $phpReturnValue -eq 0 ];
	then
		# exited successfully		
		logger -t $tag "General Monitor updated."
		((opOKPoll++))
	else
		# exited with errors
		logger -t $tag "Error: General Monitor update failed. Loop Time was ${opLastTimePoll}. Sending a notification and restarting Calduino."
		((opNOKPoll++))
		
		# send a IFTTT notification
		curl -X POST -H "Content-Type: application/json" -d '{"value1":"'$opLastTimePoll'"}' https://maker.ifttt.com/trigger/calduino_error/with/key/$userIFTTTKey 2>&1
		logger -t $tag "Loop Time was ${opLastTimePoll}, sending a notification and restarting Calduino."
		
		# restart calduino
		php -f $RFWrapperPath 'parameter=sendToRF&lightId=3&lightStatus=0'
		sleep 15
		php -f $RFWrapperPath 'parameter=sendToRF&lightId=3&lightStatus=1'
	fi
	
	# calculate mean operation time
	opMeanTimePoll=$(echo "8 k $opMeanTimePoll $totalOP / $totalOP 1 - * $opLastTimePoll $totalOP / + p" | dc)
	LANG=C  opMeanTimePoll=$(printf "%.*f\n" 2 $opMeanTimePoll)
			
	# create a xml file containing pollCalduino results
	echo "<pollCalduino>" > $pollMonitorXMLPath
	echo "<opOKPoll>"$opOKPoll"</opOKPoll>" >> $pollMonitorXMLPath
	echo "<opNOKPoll>"$opNOKPoll"</opNOKPoll>" >> $pollMonitorXMLPath
	echo "<opLastTimePoll>"$opLastTimePoll"</opLastTimePoll>" >> $pollMonitorXMLPath
	echo "<opMeanTimePoll>"$opMeanTimePoll"</opMeanTimePoll>" >> $pollMonitorXMLPath
	echo "</pollCalduino>" >> $pollMonitorXMLPath
}

# Check the boiler time drift. If greater than allowed, send a notification
function checkRCDatetime() {

	timeDrift=$(php -f $calduinoWrapperPath 'parameter=checkRCDatetime')
	timeDrift=${timeDrift//[[:space:]]/}
	
	if (( $timeDrift > maxDriftAllowed))
	then
		# drift detected		
		logger -t $tag "Time Drift detected. Sending a notification."
		curl -X POST -H "Content-Type: application/json" -d '{"value1":"'$timeDrift'"}' https://maker.ifttt.com/trigger/calduino_incorrectTime/with/key/$userIFTTTKey 2>&1			
	else
		logger -t $tag "Drift calculated. Value is $timeDrift."
	fi
}

logger -t $tag "Loading Poll Calduino."

# wait until weewx creates the php file
while [ ! -f $calduinoWrapperPath ] && [ ! -f $RFWrapperPath ]
do
	logger -t $tag "Waiting until weeWX starts and generate the scripts."
  sleep 15
done

logger -t $tag "Scripts found. Starting loop."

while true
do
	# update general monitor XML
	updateGeneralMonitor	
	
	# check boiler time desviation only once per hour
	if (( ($(date +%-M) % 59) == $minuteEnd ))
	then
		checkRCDatetime
	fi
		
	# calculate next loop wait time	
	loopWaitTime=$(( (((60 * (5 - ($(date +%-M) % 5))) + ((( minuteEnd * 60 )) - $(date +%-S))) % 300 ) ))	

	logger -t $tag "Loop ended in $opLastTimePoll seconds. Mean is $opMeanTimePoll. Total OP is $totalOP, OK is $opOKPoll and NOK is $opNOKPoll. Sleeping until minute $minuteEnd/$(($minuteEnd+5)). Will sleep $loopWaitTime seconds."			
	sleep $loopWaitTime
	
done
