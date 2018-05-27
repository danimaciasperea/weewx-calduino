# installer for calduino extension
# Copyright 2018 Daniel Macias Perea

from setup import ExtensionInstaller

def loader():
    return CalguinoInstaller()

class CalguinoInstaller(ExtensionInstaller):
    def __init__(self):
        super(CalguinoInstaller, self).__init__(
            version="0.1",
            name='calduino',
            description='Collect and display data from Calduino connected to EMS compatible Boiler.',
            author="Daniel Macias Perea",
            author_email="dani.macias.perea@gmail.com",
            data_services='user.calduino.CalduinoMonitor',
            archive_services='user.calduino.CalduinoArchive',
            config={
                'Calduino': {
                    'data_binding': 'calduino_binding',
                    'xml_path': '/var/www/html/calduino/'},
                'DataBindings': {
                    'calduino_binding': {
                        'database': 'calduino_sqlite',
                        'table_name': 'archive',
                        'manager': 'weewx.manager.DaySummaryManager',
                        'schema': 'user.calduino.schema'}},
                'Databases': {
                    'calduino_sqlite': {
                        'database_name': 'calduino.sdb',
                        'driver': 'weedb.sqlite'}},
                'StdReport': {
                    'HTMLCalduinoPages': {
                        'skin': 'calduino',
                        'HTML_ROOT': '/var/www/html/calduino'}},
                'StdQC': {
                    'MinMax': {
                        'extTemp' : '-40, 70',
                        'selImpTemp' : '0, 100',
                        'curImpTemp' : '0, 100',
                        'retTemp' : '0, 100',
                        'boilTemp' : '0, 100',
                        'selTempDHW' : '0, 100',
                        'curTempDHW' : '0, 100',
                        'selRoomTempHC1' : '0, 30',
                        'selRoomTempHC2' : '0, 30',
                        'selRoomTempHC3' : '0, 30',
                        'selRoomTempHC4' : '0, 30',
                        'selImpTempMM10' : '0, 100',
                        'curImpTempMM10' : '0, 100',
                        'selBurnPow' : '0, 150',
                        'curBurnPow' : '0, 150',
                        'pumpMod' : '0, 150',
                        'modMM10' : '0, 150',
                        'flameCurr' : '0, 100',
                        'sysPress' : '0, 2',
                        'UBAWorkMin' : '0, 5',
                        'burnWorkMin' : '0, 5',
                        'burnWorkMinH' : '0, 5',
                        'burnWorkMinDHW' : '0, 5',                       
                        'burnStarts' : '0, 10',
                        'burnStartsDHW' : '0, 10'}}},
            files=[('bin/user',
                    ['bin/user/calduino.py']),
                   ('skins/calduino',
                    ['skins/calduino/calduinoControlPanel.html.tmpl',
                     'skins/calduino/calduinoWrapper.php.tmpl',
                     'skins/calduino/index.html.tmpl',
                     'skins/calduino/skin.conf']),
                   ('skins/calduino/js',
                    ['skins/calduino/js/calduino.js']),
                   ('skins/calduino/icons',
                    ['skins/calduino/icons/BurnGasOff.png',
                     'skins/calduino/icons/BurnGasOn.png',
                     'skins/calduino/icons/CircDHWOff.png',
                     'skins/calduino/icons/CircDHWOn.png',
                     'skins/calduino/icons/DayModeDHWOff.png',
                     'skins/calduino/icons/DayModeDHWOn.png',
                     'skins/calduino/icons/DayModHCOff.png',
                     'skins/calduino/icons/DayModHCOn.png',
                     'skins/calduino/icons/FanWorkOff.png',
                     'skins/calduino/icons/FanWorkOn.png',
                     'skins/calduino/icons/HeatPmpOff.png',
                     'skins/calduino/icons/HeatPmpOn.png',
                     'skins/calduino/icons/IgnWorkOff.png',
                     'skins/calduino/icons/IgnWorkOn.png',
                     'skins/calduino/icons/PrepareDHWOff.png',
                     'skins/calduino/icons/PrepareDHWOn.png',
                     'skins/calduino/icons/SummerModHCOff.png',
                     'skins/calduino/icons/SummerModHCOn.png',
                     'skins/calduino/icons/Way3ValveDHWOff.png',
                     'skins/calduino/icons/Way3ValveDHWOn.png']),
                   ]
           )
