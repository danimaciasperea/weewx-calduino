	var calduinoParameters = 
		[{datagram:"WorkingModeHC1",name:"SelDayTempHC",type:"float",value:"20.0"},	//0
		{datagram:"WorkingModeHC2",name:"SelDayTempHC",type:"float",value:"20.0"},
		{datagram:"WorkingModeHC1",name:"SelNightTempHC",type:"float",value:"20.0"},
		{datagram:"WorkingModeHC2",name:"SelNightTempHC",type:"float",value:"20.0"},
		{datagram:"WorkingModeHC1",name:"WorkModeHC",type:"select-one",value:"2"},
		{datagram:"WorkingModeHC2",name:"WorkModeHC",type:"select-one",value:"2"},		//5					
		{datagram:"Program1HC1",name:"ProgramName",type:"select-one",value:"0"},
		{datagram:"Program1HC2",name:"ProgramName",type:"select-one",value:"0"},						
		{datagram:"WorkingModeHC1",name:"RoomTempOffHC",type:"float",value:"0.0"},
		{datagram:"WorkingModeHC2",name:"RoomTempOffHC",type:"float",value:"0.0"},
		{datagram:"WorkingModeHC1",name:"NightSetbackHC",type:"select-one",value:"3"},	//10
		{datagram:"WorkingModeHC2",name:"NightSetbackHC",type:"select-one",value:"3"},
		{datagram:"WorkingModeHC1",name:"NightOutTempHC",type:"float",value:"5"},
		{datagram:"WorkingModeHC2",name:"NightOutTempHC",type:"float",value:"5"},
		{datagram:"WorkingModeHC1",name:"SWThresTempHC",type:"number",value:"10"},
		{datagram:"WorkingModeHC2",name:"SWThresTempHC",type:"number",value:"10"},		//15					
		{datagram:"UBAParameterDHW",name:"SelTempDHW",type:"number",value:"40.0"},
		{datagram:"UBAMonitorDHW",name:"OneTimeDHW",type:"select-one",value:"1"},
		{datagram:"WorkingModeDHW",name:"WorkModeDHW",type:"select-one",value:"1"},
		{datagram:"WorkingModeDHW",name:"ProgDHW",type:"select-one",value:"0"},
		{datagram:"WorkingModeDHW",name:"WorkModeTDDHW",type:"select-one",value:"0"},	//20		
		{datagram:"UBAParameterDHW",name:"SelTempTDDHW",type:"number",value:"0"},		
		{datagram:"WorkingModeDHW",name:"DayTDDHW",type:"select-one",value:"0"},
		{datagram:"WorkingModeDHW",name:"HourTDDHW",type:"number",value:"0"},
		{datagram:"UBAMonitorFast",name:"BurnGas",type:"image",value:"0"},
		{datagram:"UBAMonitorFast",name:"IgnWork",type:"image",value:"0"},				//25
		{datagram:"UBAMonitorFast",name:"FanWork",type:"image",value:"0"},
		{datagram:"UBAMonitorFast",name:"HeatPmp",type:"image",value:"0"},
		{datagram:"UBAMonitorFast",name:"Way3ValveDHW",type:"image",value:"0"},
		{datagram:"UBAMonitorFast",name:"CircDHW",type:"image",value:"0"},
		{datagram:"MonitorHC1",name:"DayModHC",type:"image",value:"0"},					//30
		{datagram:"MonitorHC1",name:"SummerModHC",type:"image",value:"0"},
		{datagram:"UBAMonitorDHW",name:"DayModeDHW",type:"image",value:"0"},
		{datagram:"UBAMonitorDHW",name:"PrepareDHW",type:"image",value:"0"},
		{datagram:"UBAMonitorFast",name:"SrvCode1",type:"text",value:""},
		{datagram:"UBAMonitorFast",name:"SrvCode2",type:"text",value:""},				//35
		{datagram:"UBAMonitorFast",name:"ErrCode",type:"number",value:""}
		];
	var initialValueProgram = [];
	var titleString = "<span class=\"glyphicon glyphicon-time\"></span> ";
	var titleEditingString = "<span class=\"glyphicon glyphicon-edit\"></span> "
	var switchPointTemplate = "<div class=\"row\" id=\"RowX\" style=\"margin-bottom: 10px;border-style: solid;border-width: 2px;border-color: #ffffff;\"><div class=\"col-md-12\"><div class=\"col-md-1 col-xs-2\" style=\"padding-top: 5px;\"><input id=\"SendX\" type=\"checkbox\" class=\"form-check-input\" name=\"SendSwitchPoint\" onchange=\"enableSendSwitchPointsButton()\" value=\"0\" checked style=\"width: 15px;height: 15px;\"></div><div class=\"col-md-2 col-xs-4\" style=\"height: 30px;padding-bottom: 0px;padding-top: 6px\"><p>Punto:X</p></div><div class=\"col-md-3 col-xs-6\"><select id=\"DayX\" name=\"Day\" onchange=\"markChanged(this)\" style=\"height: 26px;\"><option value=\"0\">Lunes</option><option value=\"1\">Martes</option><option value=\"2\">Miercoles</option><option value=\"3\">Jueves</option><option value=\"4\">Viernes</option><option value=\"5\">Sabado</option><option value=\"6\">Domingo</option></select></div><div class=\"col-md-2 col-xs-4\"><select id=\"ActionX\" name=\"Operation\" onchange=\"markChanged(this)\" style=\"height: 26px;\"><option value=\"0\">Off</option><option value=\"1\">On</option><option value=\"7\">No</option></select></div><div class=\"col-md-4 col-xs-8\" style=\"padding-top: 4px;\"><div class=\"col-xs-5 col-md-5 text-right no-padding\"><input id=\"HourX\" type=\"number\" name=\"quantity\" min=\"0\" max=\"23\" step=\"1\" pattern=\"[0-9]{2}$\" onchange=\"markChanged(this)\" style=\"text-align: center;\"></div><div class=\"col-xs-1 col-md-1\" style=\"padding-left: 5px;padding-right: 5px;padding-bottom: 0px;height: 26px;padding-top: 5px;\"><p>:</p></div><div class=\"col-xs-5 col-md-5 text-left no-padding\"><input id=\"MinuteX\" type=\"number\" name=\"quantity\" min=\"0\" max=\"55\" step=\"10\" pattern=\"[0-9]{2}$\" onchange=\"markChanged(this)\" style=\"text-align: center;\"></div></div></div></div>";
	const switchPoints = 42;
	
	function changeTemporaryElementBorder(elementId, borderColor, time)
	{
			
		document.getElementById(elementId).style.borderColor = borderColor;
		setTimeout(function() {
			document.getElementById(elementId).style.borderColor = "#ffffff";		
			}, time);	
	}
		
	function updateCalduinoValues() {
			
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4) {
				if (this.status == 200) {						
					parseGeneralMonitorXML(this);
					changeTemporaryElementBorder('controlPanelDiv','#00ff00',2000);
					refreshHTML();					
				} else {
					changeTemporaryElementBorder('controlPanelDiv','#00ff00',2000); 
				}		
			}
		};
		xmlhttp.open("GET", "generalMonitor.xml", true);
		xmlhttp.send();			
	}
	
	function parseGeneralMonitorXML(xml)
	{
		var i;
		var xmlDoc = xml.responseXML;
			for (i in calduinoParameters)
			{	
				calduinoParameters[i].value = (calduinoParameters[i].type == "number") ? parseFloat(xmlDoc.getElementsByTagName(calduinoParameters[i].datagram)[0].getElementsByTagName(calduinoParameters[i].name)[0].textContent) : xmlDoc.getElementsByTagName(calduinoParameters[i].datagram)[0].getElementsByTagName(calduinoParameters[i].name)[0].textContent;
			}		
	}
	
	function refreshHTML()
	{
		for (i in calduinoParameters) {
			
			switch(calduinoParameters[i].type)
			{
				case "float":
					document.getElementById(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name).value = parseFloat(calduinoParameters[i].value).toFixed(1);	
					break;
				case "number":
					document.getElementById(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name).innerHTML = parseInt(calduinoParameters[i].value);	
					document.getElementById(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name).value = parseInt(calduinoParameters[i].value);
					break;
				case "select-one":
					document.getElementById(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name).value = calduinoParameters[i].value;
					break;
				case "image":
					if (calduinoParameters[i].value == 0)
					{
						document.getElementById(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name).src = "icons/"+calduinoParameters[i].name+"Off.png";
					}
					else
					{
						document.getElementById(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name).src = "icons/"+calduinoParameters[i].name+"On.png";
					}	 
					break;
				case "text":
					document.getElementById(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name).innerHTML = String.fromCharCode(calduinoParameters[i].value);
					break;
				default:
					break;
			}				
		}
		
		document.getElementById("sendButton").disabled = true; 
		document.getElementById("UBAMonitorFast-ErrCodeText").innerHTML = translateErrorCode(calduinoParameters[34].value + "-" + calduinoParameters[35].value,calduinoParameters[36].value);
		enableAllElements();
		
	}
	
	function translateErrorCode(SrvCode,ErrCode)
	{
		returnString = " ";
		
		switch(SrvCode + ErrCode){
			case "0-H203":
				returnString = "Sistema en espera. No es necesario calentar agua."
				break;
			case "-H200":
				returnString = "Sistema en modo calefacción. Quemador encendido."
			break;
			case "=H2507":
			case "=H200":
				returnString = "Calentando ACS."
			break;			
			case "0-Y204":
				returnString = "La temperatura de impulsión deseada es superior a la temperatura de impulsión real."
			break;			
			case "0-L284":
				returnString = "Apertura de válvula de gas."
			break;	
			case "0-C283":
				returnString = "Encendiendo quemador."
			break;
			default:
				returnString = "Sistema en espera."
				break;					
		}
		return returnString;
	}
	
	function enableAllElements()
	{
		for (i in calduinoParameters){
			document.getElementById(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name).disabled = false;					
		}
		
		document.getElementById("Program1HC1-ProgramName-Button").disabled = false;
		document.getElementById("Program1HC2-ProgramName-Button").disabled = false;
		document.getElementById("ProgramDHW-Button").disabled = false;	
		
		for (i in calduinoParameters){ 
			disableSelective(i);					
		}	
		
	
	}
	
	function disableSelective(i)
	{
		if (calduinoParameters[i].name.startsWith("WorkMod"))
		{
			switch(Number(calduinoParameters[i].value))
			{
				case 0:
				{
					// Work Mode of a Circuit
					if (calduinoParameters[i].name.endsWith("HC"))
					{											
						// deactivate temperature day
						document.getElementById(calduinoParameters[i].datagram + "-" + "SelDayTempHC").disabled = true;
						
						// deactivate select and edit program
						document.getElementById("Program1" + calduinoParameters[i].datagram.slice(-3) + "-" + "ProgramName").disabled = true;
						document.getElementById("Program1" + calduinoParameters[i].datagram.slice(-3) + "-" + "ProgramName" + "-" + "Button").disabled = true;

						// deactivate setbackModeTemperature if setbackMode is not 3
						if(Number(document.getElementById(calduinoParameters[i].datagram + "-" + "NightSetbackHC").value) != 3)
						{
							document.getElementById(calduinoParameters[i].datagram + "-" +"NightOutTempHC").disabled = true;
						}								
						
						// deactivate winter/summer threshold
						document.getElementById(calduinoParameters[i].datagram + "-" + "SWThresTempHC").disabled = true;	
						
					}
					
					// Work Mode of Thermal Disinfection
					else if (calduinoParameters[i].name.endsWith("TDDHW"))
					{						
						// deactivate temperature DHW
						document.getElementById("UBAParameterDHW-SelTempTDDHW").disabled = true;

						// deactivate day and hour of DHW
						document.getElementById("WorkingModeDHW-DayTDDHW").disabled = true;
						document.getElementById("WorkingModeDHW-HourTDDHW").disabled = true;
					}
					
					// Work Mode of DHW
					else
					{
						// deactivate temperature DHW
						//document.getElementById("UBAParameterDHW-SelTempDHW").disabled = true;
						
						// deactivate select and edit program
						document.getElementById("WorkingModeDHW-ProgDHW").disabled = true;
						document.getElementById("ProgramDHW-Button").disabled = true;	
					}
					break;
				}
				
				case 1:
				{
					// Work Mode of a Circuit
					if (calduinoParameters[i].name.endsWith("HC"))
					{						
						// deactivate temperature night
						document.getElementById(calduinoParameters[i].datagram + "-" + "SelNightTempHC").disabled = true;
						
						// deactivate select and edit program
						document.getElementById("Program1" + calduinoParameters[i].datagram.slice(-3) + "-" + "ProgramName").disabled = true;
						document.getElementById("Program1" + calduinoParameters[i].datagram.slice(-3) + "-" + "ProgramName" + "-" +"Button").disabled = true;
						
						// deactivate setbackMode and setbackModeTemperature
						document.getElementById(calduinoParameters[i].datagram + "-" + "NightOutTempHC").disabled = true;
						document.getElementById(calduinoParameters[i].datagram + "-" + "NightSetbackHC").disabled = true;

						// deactivate winter/summer threshold
						document.getElementById(calduinoParameters[i].datagram + "-" + "SWThresTempHC").disabled = true;
					}
					
					// Work Mode of DHW
					else
					{						
						// deactivate select and edit program
						document.getElementById("WorkingModeDHW-ProgDHW").disabled = true;
						document.getElementById("ProgramDHW-Button").disabled = true;	
					}
					break;									
				}
				
				case 2:
				{
					// Work Mode of a Circuit
					if (calduinoParameters[i].name.endsWith("HC"))
					{												
						// deactivate edit program button  if program is not 0 or 9																	
						if(!((Number(document.getElementById("Program1" + calduinoParameters[i].datagram.slice(-3) + "-" + "ProgramName").value) == 0) || Number((document.getElementById("Program1" + calduinoParameters[i].datagram.slice(-3) + "-" + "ProgramName").value) == 9)))
						{
							document.getElementById("Program1" + calduinoParameters[i].datagram.slice(-3) + "-" + "ProgramName" + "-" + "Button").disabled = true;
						}

						// deactivate setbackModeTemperature if setbackMode is not 3
						if(Number(document.getElementById(calduinoParameters[i].datagram + "-" + "NightSetbackHC").value) != 3)
						{
							document.getElementById(calduinoParameters[i].datagram  + "-" + "NightOutTempHC").disabled = true;
						}						
					}
					
					// Work Mode of DHW
					else
					{
						// activate edit program button only if program is 255	
						if((Number(document.getElementById("WorkingModeDHW-ProgDHW").value) != 255))
						{
							document.getElementById("ProgramDHW-Button").disabled = true;
						}
					}
					
					break;													
				}
			}
		}				
	} 

	
	function disableAllElements(currentId) {
	
		document.getElementById("ProgramDHW-Button").disabled = true;
		document.getElementById("Program1HC1-ProgramName-Button").disabled = true;
		document.getElementById("Program1HC2-ProgramName-Button").disabled = true;
		
		for (i in calduinoParameters)
		{
			// search position of current element
			if (currentId.id == (calduinoParameters[i].datagram + "-" + calduinoParameters[i].name))
			{
				// if type is float, parse to only one decimal
				if (calduinoParameters[i].type == "float")
				{
					currentId.value = parseFloat(currentId.value).toFixed(1);
				}
				
				// if the value has not changed 
				if (currentId.value == calduinoParameters[i].value)
				{
					for (j in calduinoParameters)
					{
						document.getElementById(calduinoParameters[j].datagram + "-" + calduinoParameters[j].name).disabled = false;							
					}
					for (j in calduinoParameters)
					{
						disableSelective(j);
					}					
					document.getElementById("sendButton").disabled = true;
				}
				
				// the value has changed
				else
				{
					for (i in calduinoParameters)
					{
						
						if (currentId.id != calduinoParameters[i].datagram.concat("-" + calduinoParameters[i].name))
						{	
							document.getElementById(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name).disabled = true;
						}						
						document.getElementById("sendButton").disabled = false;
					}				
				}
				break;
			}			
		}		
	}
	
	function updateGeneralMonitorXML()
	{
	
		document.getElementById("modalTitle").innerHTML = titleString + "Comunicando con Calduino...";
		document.getElementById("modalParam").innerHTML = "Actualizando valores...";
		document.getElementById("modalValue").innerHTML = "";
		
		$("#sendingDataModal").modal({backdrop: 'static', keyboard: false});
		
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function()
		{
			if (this.readyState == 4)
			{
				if (this.status == 200)
				{
					updateCalduinoValues();
				}
				else
				{
					changeTemporaryElementBorder('controlPanelDiv','#ff0000',2000); 
				}
				$("#sendingDataModal").modal('hide');					
			}				
		};
		
		xmlhttp.open("POST", "calduinoWrapper.php", true);
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlhttp.send("parameter=getGeneralMonitor");				
	}
	
	function sendValue()
	{
		if (document.getElementById("controlPanelForm").checkValidity())
		{
			for (i in calduinoParameters)
			{
				if ((calduinoParameters[i].value != document.getElementById(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name).value) && ((calduinoParameters[i].type!="image")||(types[i].type!="text")))
				{
					var updatedParam =  calduinoParameters[i].datagram + "-" +calduinoParameters[i].name;
					var updatedValue = document.getElementById(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name).value;
					document.getElementById("modalParam").innerHTML = "Par&#225;metro: <b>"+ updatedParam;
					document.getElementById("modalValue").innerHTML = "Valor fijado: <b>"+ updatedValue;			
					document.getElementById("modalTitle").innerHTML = titleString + "Comunicando con Calduino...";
								
					$("#sendingDataModal").modal({backdrop: 'static', keyboard: false});
					
					var xmlhttp = new XMLHttpRequest();
					
					xmlhttp.onreadystatechange = function()
					{
						if (this.readyState == 4)
						{
							if (this.status == 200) 
							{
								calduinoParameters[i].value = updatedValue;
								changeTemporaryElementBorder(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name + "-" + "Div",'#00ff00',2000);
								document.getElementById("sendButton").disabled = true;
								enableAllElements();
							}
							else
							{
								changeTemporaryElementBorder(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name + "-" + "Div",'#ff0000',2000);
								document.getElementById(calduinoParameters[i].datagram + "-" + calduinoParameters[i].name).value = calduinoParameters[i].value;
								document.getElementById("sendButton").disabled = true;
								enableAllElements();
							}
							
							$("#sendingDataModal").modal('hide');	
						}				
					};
					
					xmlhttp.open("POST", "calduinoWrapper.php", true);
					xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					xmlhttp.send("parameter="+updatedParam+"&value="+updatedValue);
								
					break;					
				}				
			}		
		}	
	}
	
	function editProgram(updatedValue){
	
		document.getElementById("settingProgramModalTitle").innerHTML = titleString + "Comunicando con Calduino...";
		document.getElementById("settingProgramModalParam").innerHTML = "Obteniendo Programa...";
		
		switch (updatedValue)
		{
			case 8:
					{
						editingProgramText = "<b>Agua Caliente</b>";
					}
					break;
			case 12:
					{
						if(calduinoParameters[6].value == 0)
						{
							updatedValue = 12;
							editingProgramText = "<b>Usuario 1 - Radiadores</b>";

						}
						if(calduinoParameters[6].value == 9)
						{
							updatedValue = 13;
							editingProgramText = "<b>Usuario 2 - Radiadores</b>";
						}
					}
					break;
			case 16:
					{
						if(calduinoParameters[7].value == 0)
						{
							updatedValue = 16;
							editingProgramText = "<b>Usuario 1 - Suelo Radiante</b>";

						}
						if(calduinoParameters[7].value == 9)
						{
							updatedValue = 17;
							editingProgramText = "<b>Usuario 2 - Suelo Radiante</b>";
						}
					}
					break;										
		}	

		editingProgram = updatedValue;
		document.getElementById("settingProgramModalValue").innerHTML = editingProgramText;
		
		$("#settingProgramModal").modal({backdrop: 'static', keyboard: true});
		document.getElementById("sendSwitchPointsButton").disabled = true;
		document.getElementById("refreshSwitchPointsButton").disabled = true;
		
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4)
			{
				if (this.status == 200)
				{
					getProgramValues();							
				}
				else
				{
					changeTemporaryElementBorder("controlPanelDiv",'#ff0000',2000);
					$("#settingProgramModal").modal('hide');					
				}				
			}				
		};
		
		xmlhttp.open("POST", "calduinoWrapper.php", true);
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlhttp.send("parameter=getProgram&value="+editingProgram);
	}
	
	function getProgramValues() {	
	
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4) {
				if (this.status == 200) {
					var HTTPCode = "";
					var xmlDoc = this.responseXML;
					var switchPointList = xmlDoc.getElementsByTagName("SwitchPoint");
					
					for (var i = 0; i < switchPoints; i++)
					{
						initialValueProgram[i] = [];
						var currentSwithPoint = switchPointTemplate.replace(/X/g, i);
						HTTPCode+=currentSwithPoint;
						var splittedSwitchPoint = switchPointList[i].textContent.split(" ");
						
						initialValueProgram[i][0] = splittedSwitchPoint[1];
						initialValueProgram[i][1] = splittedSwitchPoint[2];
						initialValueProgram[i][2] = splittedSwitchPoint[3];
						initialValueProgram[i][3] = splittedSwitchPoint[4];														
					}
					
					document.getElementById("settingProgramTable").innerHTML = HTTPCode;
					refreshProgramSwitchPoints();
					
					document.getElementById("settingProgramTable").style.display = 'block';
					document.getElementById("chargingProgramProgressBar").style.display = 'none';
					document.getElementById("settingProgramModalTitle").innerHTML = titleEditingString + "Editando programa";
					document.getElementById("settingProgramModalParam").innerHTML = "";						
				}
				else
				{
					changeTemporaryElementBorder("controlPanelDiv",'#ff0000',2000);
					$("#settingProgramModal").modal('hide');
				}
			}					
		};
		xmlhttp.open("GET", "program.xml", true);
		xmlhttp.send();			
			
	}
	
	function refreshProgramSwitchPoints()
	{		
		for (var i = 0; i < switchPoints; i++)
		{
			document.getElementById("Action"+i).value = initialValueProgram[i][0];				
			document.getElementById("Send"+i).checked = false;	
			document.getElementById("Day"+i).value ="";
			
			if (initialValueProgram[i][0] != 7)
			{
				document.getElementById("Day"+i).value = initialValueProgram[i][1];
				document.getElementById("Hour"+i).value = (initialValueProgram[i][2].length === 1)?("0"+initialValueProgram[i][2]):(initialValueProgram[i][2]);
				document.getElementById("Minute"+i).value = (initialValueProgram[i][3].length === 1)?("0"+initialValueProgram[i][3]):(initialValueProgram[i][3]);
			}			
		}
		
		document.getElementById("refreshSwitchPointsButton").disabled = true;
		document.getElementById("sendSwitchPointsButton").disabled = true;				
	}
	
	function deleteProgramValues()
	{		
		for (var i = 0; i<switchPoints; i++)
		{
			document.getElementById("settingProgramTable").innerHTML = "";
		}
		
		document.getElementById("chargingProgramProgressBar").style.display = 'block';
	}
	
	function markChanged(currentId)
	{
		var i = currentId.id.replace ( /[^\d.]/g, '' );
		var checked;
		
		checked = !((document.getElementById("Action"+i).value == initialValueProgram[i][0])  && (document.getElementById("Day"+i).value == initialValueProgram[i][1]) &&(Number(document.getElementById("Hour"+i).value) == initialValueProgram[i][2]) && (Number(document.getElementById("Minute"+i).value) == initialValueProgram[i][3]));			
		
		checked &= ((document.getElementById("Action"+i).value != "") && (document.getElementById("Day"+i).value != "") && ((document.getElementById("Hour"+i).value) != "") && (document.getElementById("Minute"+i).value != ""))
		
		if (currentId.id.includes("Hour") || currentId.id.includes("Minute"))
		{
			formatValue(currentId);
		}		
		
		document.getElementById("Send"+i).checked = checked;
		enableSendSwitchPointsButton();
	}
	
	function formatValue(input)
	{
		if(input.value.length === 1)
		{
			input.value = "0" + input.value;
		}
	}
	
	function enableSendSwitchPointsButton()
	{
		activeenableSendSwitchPoints = 0;
		
		for (var i = 0; i<switchPoints; i++)
		{
			if ((document.getElementById("Send"+i).checked))
			{
				activeenableSendSwitchPoints++;
			}
		}
		
		
		document.getElementById("sendSwitchPointsButton").disabled = (activeenableSendSwitchPoints == 0);
		document.getElementById("refreshSwitchPointsButton").disabled  = (activeenableSendSwitchPoints == 0); 
	}
	
	function changeEnableOptionSwithPoints(disableValue){
		
		for (var i = 0; i<switchPoints; i++)
		{
			document.getElementById("Action"+i).disabled = disableValue;
			document.getElementById("Day"+i).disabled = disableValue;
			document.getElementById("Hour"+i).disabled = disableValue;
			document.getElementById("Minute"+i).disabled = disableValue;			
			document.getElementById("Send"+i).disabled = disableValue;
		}
		
		document.getElementById("refreshSwitchPointsButton").disabled = disableValue;
		document.getElementById("sendSwitchPointsButton").disabled = disableValue;
		document.getElementById("closeSwitchPointsButton").disabled = disableValue;

	}
		
	function sendProgramSwithPoints()
	{		
		changeEnableOptionSwithPoints(true);
		
		for (var i = 0; i<switchPoints; i++)
		{
			if (document.getElementById("Send"+i).checked)
			{			
				var settedAction = document.getElementById("Action"+i).value;
				var settedDay = document.getElementById("Day"+i).value;
				var settedHour = document.getElementById("Hour"+i).value;
				var settedMinute = document.getElementById("Minute"+i).value;
				
				document.getElementById("chargingProgramProgressBar").style.display = 'block';
				document.getElementById("settingProgramModalParam").innerHTML = editingProgramText;
				document.getElementById("settingProgramModalValue").innerHTML = "Par&#225;metros: Punto <b>"+ i +"</b> Acci&#243;n <b>"+ settedAction +"</b> D&#237;a <b>"+ settedDay +"</b> Hora <b>"+ settedHour +"</b> Minuto <b>"+ settedMinute +"</b>";			
				document.getElementById("settingProgramModalTitle").innerHTML = titleString + "Comunicando con Calduino...";					
				activeenableSendSwitchPoints--;

				
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.onreadystatechange = function (subi, fi) {
					return function()
					{
						if (this.readyState == 4) {
							if (this.status == 200) {
								changeTemporaryElementBorder("Row"+subi,'#00ff00',2000);
								document.getElementById("Send"+subi).checked = false;
								initialValueProgram[subi][0] = document.getElementById("Action"+subi).value;
								if (initialValueProgram[subi][0] == 7)
								{
									document.getElementById("Day"+subi).value = "";
									document.getElementById("Hour"+subi).value = "";
									document.getElementById("Minute"+subi).value = "";
								}
								initialValueProgram[subi][1] = document.getElementById("Day"+subi).value;
								initialValueProgram[subi][2] = document.getElementById("Hour"+subi).value;
								initialValueProgram[subi][3] = document.getElementById("Minute"+subi).value;
							}
							else
							{
								changeTemporaryElementBorder("Row"+subi,'#ff0000',2000);
							}
							if (fi)
							{
								refreshProgramSwitchPoints();
								document.getElementById("settingProgramTable").style.display = 'block';
								document.getElementById("chargingProgramProgressBar").style.display = 'none';
								document.getElementById("settingProgramModalTitle").innerHTML = titleEditingString + "Editando programa";
								document.getElementById("settingProgramModalParam").innerHTML = "";
								document.getElementById("settingProgramModalValue").innerHTML = editingProgramText;										
								changeEnableOptionSwithPoints(false);
								enableSendSwitchPointsButton();
							}
						}
					};
				}(i,(activeenableSendSwitchPoints==0));    
				
				xmlhttp.open("POST", "calduinoWrapper.php", true); 
				xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xmlhttp.send("parameter=setSwitchPoint"+"&value="+editingProgram+"&switchPoint="+i+"&action="+settedAction+"&day="+settedDay+"&hour="+settedHour+"&minute="+settedMinute);								
			}
		}					
	}	