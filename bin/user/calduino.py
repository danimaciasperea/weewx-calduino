import weewx
import syslog
import time
import os
import stat
import weewx.tags

from weewx.cheetahgenerator import SearchList
from weewx.engine import StdService
from xml.etree import ElementTree as ET
from shutil import copy2
from enum import Enum

DRIVER_VERSION = "2.0"
XML_DEFAULT_SOURCE_DIR = '/var/www/html/calduino/'

def loginf(source, msg):
    syslog.syslog('%s %s' % (source,msg))

schema = [
    ('dateTime',             'INTEGER NOT NULL PRIMARY KEY'),
	('usUnits',              'INTEGER NOT NULL'),
    ('interval',             'INTEGER NOT NULL'),
    ('extTemp',              'REAL'),
    ('selImpTemp',           'INTEGER'),
    ('curImpTemp',           'REAL'),
    ('retTemp',              'REAL'),
    ('boilTemp',             'REAL'),
    ('selTempDHW',           'INTEGER'),
    ('curTempDHW',           'REAL'),
    ('selRoomTempHC1',       'REAL'),
    ('selRoomTempHC2',       'REAL'),
    ('selRoomTempHC3',       'REAL'),
    ('selRoomTempHC4',       'REAL'),
    ('selImpTempMM10',       'INTEGER'),
    ('curImpTempMM10',       'REAL'),
    ('selBurnPow',           'INTEGER'),
    ('curBurnPow',           'INTEGER'),
    ('pumpMod',              'INTEGER'),
    ('modMM10',              'INTEGER'),
    ('flameCurr',            'REAL'),
    ('sysPress',             'REAL'),
    ('UBAWorkMin',           'INTEGER'),
    ('burnWorkMin',          'INTEGER'),
    ('burnWorkMinH',         'INTEGER'),   
    ('burnWorkMinDHW',       'INTEGER'),     
    ('burnStarts',           'INTEGER'),
    ('burnStartsDHW',        'INTEGER')]

class Monitor(Enum):
    UBAWorkingTime = 0
    UBAMonitorFast = 1
    UBAMonitorSlow = 2
    UBAParameterDHW = 3
    UBAMonitorDHW = 4
    WorkingModeDHW = 5
    MonitorHC1 = 6
    WorkingModeHC1 = 7
    Program1HC1 = 8
    MonitorHC2 = 9
    WorkingModeHC2 = 10
    Program1HC2 = 11
    MonitorMM10 = 12
    Calduino = 13

class CalduinoArchive(StdService):

    """ Service to store Calduino specific archive data. """
    def __init__(self, engine, config_dict):
        super(CalduinoArchive, self).__init__(engine, config_dict)

        # Extract our binding from the calduino section of the config file. If
        # it's missing, fill with a default
        if 'Calduino' in config_dict:
            self.data_binding = config_dict['Calduino'].get('data_binding',
                                                           'calduino_binding')
        else:
            self.data_binding = 'calduino_binding'

        loginf("CalduinoArchive:", "CalduinoArchive will use data binding %s" % self.data_binding)

        # setup our database if needed
        self.setup_database(config_dict)

        # bind ourselves to NEW_ARCHIVE_RECORD event
        self.bind(weewx.NEW_ARCHIVE_RECORD, self.new_archive_record)
    
    def new_archive_record(self, event):
        """Called when a new archive record has arrived."""

        dbmanager = self.engine.db_binder.get_manager(self.data_binding)
        dbmanager.addRecord(event.record)
    
    def setup_database(self, config_dict):
        """Setup the main database archive"""
        
        # This will create the database if it doesn't exist, then return an
        # opened instance of the database manager.
        dbmanager = self.engine.db_binder.get_manager(self.data_binding, initialize=True)
        loginf("CalduinoArchive:", "Using binding '%s' to database '%s'" % (self.data_binding,
                                                                      dbmanager.database_name))
          
        # Back fill the daily summaries.
        loginf("CalduinoArchive:", "Starting backfill of daily summaries")
        t1 = time.time()
        nrecs, ndays = dbmanager.backfill_day_summary()
        tdiff = time.time() - t1
        if nrecs:
            _msg = "Processed %d records to backfill %d day summaries in %.2f seconds" % (nrecs,
                                                                                          ndays,
                                                                                          tdiff)
        else:
            _msg = "Daily summaries up to date."
        loginf("CalduinoArchive:", _msg)       
        
class CalduinoMonitor(StdService):
    """Collect data from Calduino connected to EMS compatible Boiler."""

    def __init__(self, engine, config_dict):
        super(CalduinoMonitor, self).__init__(engine, config_dict)
        loginf("CalduinoMonitor:","Monitor version is %s" % DRIVER_VERSION)
        
        # Extract the xml location from the calduino section of the config file. If
        # it's missing, fill with a default
        if 'Calduino' in config_dict:
            self.xml_source_dir = config_dict['Calduino'].get('XML_ROOT',
                                                           XML_DEFAULT_SOURCE_DIR)
        else:
            self.xml_source_dir = '/var/www/html/calduino/'
        
        loginf("CalduinoMonitor:","XML files located in %s" % self.xml_source_dir)
        
        # create the directory if it does not exists
        if not os.path.exists(self.xml_source_dir):
            os.makedirs(self.xml_source_dir)
            
        # Grant permissions in the xml_source_dir location (weewx run as root, apache as www-data)
        os.chmod(self.xml_source_dir, stat.S_IRWXO);
        
        # Extract the values of the first loop from the xml file
        self.last_UBAWorkMin = self.last_burnWorkMin = self.last_burnWorkMinH = self.last_burnWorkMinDHW = self.last_burnStarts = self.last_burnStartsDHW = None
        self.last_RTC = None
        self.backupXML = False
        
        try:
            tree = ET.parse(self.xml_source_dir + "generalMonitor.xml")
            root = tree.getroot()            
                        
            self.last_UBAWorkMin = int(root[int(Monitor.UBAWorkingTime)][0].text)
            self.last_burnWorkMin = int(root[int(Monitor.UBAMonitorSlow)][4].text)
            self.last_burnWorkMinH = int(root[int(Monitor.UBAMonitorSlow)][5].text)
            self.last_burnWorkMinDHW  = int(root[int(Monitor.UBAMonitorDHW)][6].text)
            self.last_burnStarts = int(root[int(Monitor.UBAMonitorSlow)][3].text)
            self.last_burnStartsDHW  = int(root[int(Monitor.UBAMonitorDHW)][5].text)
            self.last_RTC = int(root[int(Monitor.Calduino)][4].text)
        except IOError:
            loginf("CalduinoMonitor:","error: cannot find generalMonitor XML.")
        except (ET.ParseError, IndexError):
            loginf("CalduinoMonitor:","error: parsing generalMonitor XML.")        
                
        self.last_ts = int(time.time() + 0.5)
        self.bind(weewx.NEW_ARCHIVE_RECORD, self.new_archive_record)
        
    def new_archive_record(self, event):
        """Called when a new archive record has arrived."""
        
        try:
            tree = ET.parse(self.xml_source_dir + "generalMonitor.xml")
            root = tree.getroot()

            if ( int(root[int(Monitor.Calduino)][4].text) > self.last_RTC ) :
            
                event.record['extTemp'] = float(root[int(Monitor.UBAMonitorSlow)][0].text)
                event.record['selImpTemp'] = int(root[int(Monitor.UBAMonitorFast)][0].text)                
                event.record['curImpTemp'] = float(root[int(Monitor.UBAMonitorFast)][1].text)                
                event.record['retTemp'] = float(root[int(Monitor.UBAMonitorFast)][10].text)                
                event.record['boilTemp'] = float(root[int(Monitor.UBAMonitorSlow)][1].text)                
                event.record['selTempDHW'] = int(root[int(Monitor.UBAParameterDHW)][0].text)
                event.record['curTempDHW'] = float(root[int(Monitor.UBAMonitorDHW)][0].text)                
                event.record['selRoomTempHC1'] = float(root[int(Monitor.MonitorHC1)][4].text)
                event.record['selRoomTempHC2'] = float(root[int(Monitor.MonitorHC2)][4].text)                
                event.record['selImpTempMM10'] = int(root[int(Monitor.MonitorMM10)][0].text)
                event.record['curImpTempMM10'] = float(root[int(Monitor.MonitorMM10)][1].text)                
                event.record['selBurnPow'] = float(root[int(Monitor.UBAMonitorFast)][2].text)
                event.record['curBurnPow'] = float(root[int(Monitor.UBAMonitorFast)][3].text)
                event.record['pumpMod'] = float(root[int(Monitor.UBAMonitorSlow)][2].text)
                event.record['modMM10'] = float(root[int(Monitor.MonitorMM10)][2].text)                
                event.record['flameCurr'] = float(root[int(Monitor.UBAMonitorFast)][11].text)
                event.record['sysPress'] = float(root[int(Monitor.UBAMonitorFast)][12].text)
                
                if self.last_UBAWorkMin is not None:
                    inc_UBAWorkMin = int(root[int(Monitor.UBAWorkingTime)][0].text) - self.last_UBAWorkMin
                    event.record['UBAWorkMin'] = inc_UBAWorkMin if inc_UBAWorkMin < 5 else 5                        
                self.last_UBAWorkMin = int(root[int(Monitor.UBAWorkingTime)][0].text)

                if self.last_burnWorkMin is not None:
                    inc_burnWorkMin = int(root[int(Monitor.UBAMonitorSlow)][4].text) - self.last_burnWorkMin
                    event.record['burnWorkMin'] = inc_burnWorkMin if inc_burnWorkMin < 5 else 5                          
                self.last_burnWorkMin = int(root[int(Monitor.UBAMonitorSlow)][4].text) 

                if self.last_burnWorkMinH is not None:
                    inc_burnWorkMinH = int(root[int(Monitor.UBAMonitorSlow)][5].text) - self.last_burnWorkMinH
                    event.record['burnWorkMinH'] = inc_burnWorkMinH if inc_burnWorkMinH < 5 else 5                      
                self.last_burnWorkMinH = int(root[int(Monitor.UBAMonitorSlow)][5].text)   

                if self.last_burnWorkMinDHW is not None:
                    inc_burnWorkMinDHW = int(root[int(Monitor.UBAMonitorDHW)][6].text) - self.last_burnWorkMinDHW
                    event.record['burnWorkMinDHW'] = inc_burnWorkMinDHW if inc_burnWorkMinDHW < 5 else 5                     
                self.last_burnWorkMinDHW = int(root[int(Monitor.UBAMonitorDHW)][6].text)  

                if self.last_burnStarts is not None:
                    inc_burnStarts = int(root[int(Monitor.UBAMonitorSlow)][3].text) - self.last_burnStarts
                    event.record['burnWorkMinDHW'] = inc_burnStarts if inc_burnStarts < 5 else 5                      
                self.last_burnStarts = int(root[int(Monitor.UBAMonitorSlow)][3].text)                

                if self.last_burnStartsDHW is not None:
                    inc_burnStartsDHW = int(root[int(Monitor.UBAMonitorDHW)][5].text) - self.last_burnStartsDHW
                    event.record['burnWorkMinDHW'] = inc_burnStartsDHW if inc_burnStartsDHW < 5 else 5                       
                self.last_burnStartsDHW = int(root[int(Monitor.UBAMonitorDHW)][5].text)                
                
                self.last_RTC = int(root[int(Monitor.Calduino)][4].text)
            else:
                loginf("CalduinoMonitor:","error: generalMonitor file was already imported. Last RTC was: %s and current RCT is: %s" % (self.last_RTC,int(root[int(Monitor.Calduino)][4].text)))
                
        except IOError:
            loginf("CalduinoMonitor:","error: cannot find generalMonitor XML in %s" %(self.xml_source_dir))
            
        except (ET.ParseError, IndexError):
            loginf("CalduinoMonitor:","error: parsing generalMonitor XML.")
            self.backupXML = True
            
        if (self.backupXML):
            if (self.last_RTC is None):
                self.last_RTC = "None"
            backupPath = self.xml_source_dir  + "errorReport/" + str(self.last_RTC) + "/"
            loginf("CalduinoMonitor:","error: Making a backup copy of the failed xml files in directory: %s" %backupPath)
            
            if not os.path.exists(backupPath):
                os.makedirs(backupPath)
            
            copy2(self.xml_source_dir + "generalMonitor.xml", backupPath + "generalMonitor.xml")
            
        self.backupXML = False 

class CalduinoSearchList(SearchList):
    def __init__(self, generator):
        
        SearchList.__init__(self, generator)
        
        self.table_dict = generator.skin_dict['CalduinoExtension']
        
        self.formatter = generator.formatter
        self.converter = generator.converter
        
        # Update this search list once every refresh_interval mins (according to refresh interval of the XML)
        self.refresh_interval = int(self.table_dict.get('refresh_interval', 5))
        self.cache_time = 0
        
        # Get the location where the XML files are located
        self.xml_source_dir = self.table_dict.get('XML_ROOT', XML_DEFAULT_SOURCE_DIR)
        
        self.search_list_extension = {} 
        
        # Initialize search list
        self.search_list_extension['upTimeCald'] = 0
        self.search_list_extension['opOKCald'] = 0
        self.search_list_extension['opNOKCald'] = 0
        self.search_list_extension['opOKPoll'] = 0
        self.search_list_extension['opNOKPoll'] = 0
        self.search_list_extension['opLastTimePoll'] = 0
        self.search_list_extension['opMeanTimePoll'] = 0
        
        # Make bootstrap specific labels in config file available to
        if 'BootstrapLabels' in generator.skin_dict:
            self.search_list_extension['BootstrapLabels'] = generator.skin_dict['BootstrapLabels']
        else:
            syslog.syslog(syslog.LOG_DEBUG, "%s: No bootstrap specific labels found" % os.path.basename(__file__))

        # Make observation labels available to templates
        if 'Labels' in generator.skin_dict:
            self.search_list_extension['Labels'] = generator.skin_dict['Labels']
        else:
            syslog.syslog(syslog.LOG_DEBUG, "%s: No observation labels found" % os.path.basename(__file__))          

        # Make observation units available to templates
        if 'Units' in generator.skin_dict:
            self.search_list_extension['Units'] = generator.skin_dict['Units']
        else:
            syslog.syslog(syslog.LOG_DEBUG, "%s: No units found" % os.path.basename(__file__)) 
            
    def get_extension_list(self, valid_timespan, db_lookup):
        """For weewx V3.x extensions. Should return a list
        of objects whose attributes or keys define the extension.

        valid_timespan:  An instance of weeutil.weeutil.TimeSpan. This will hold the
        start and stop times of the domain of valid times.

        db_lookup: A function with call signature db_lookup(data_binding), which
        returns a database manager and where data_binding is an optional binding
        name. If not given, then a default binding will be used.
        """	
        
        # Time to recalculate?
        if (time.time() - (self.refresh_interval * 60)) > self.cache_time:
            self.cache_time = time.time()            
            t1 = time.time()
            
            try:
                # analyzing generalMonitor
                tree = ET.parse(self.xml_source_dir + "generalMonitor.xml")
                root = tree.getroot()
                
                self.search_list_extension['upTimeCald'] = weewx.units.ValueHelper(value_t=(int(root[int(Monitor.Calduino)][0].text), "second", "group_deltatime"), formatter=self. , converter=self.converter)
                self.search_list_extension['opOKCald'] = int(root[int(Monitor.Calduino)][2].text)
                self.search_list_extension['opNOKCald'] = int(root[int(Monitor.Calduino)][3].text)
            
            except IOError:
                loginf("CalduinoSearchList:","error: cannot find generalMonitor XML")
            except (ET.ParseError, IndexError):
               loginf("CalduinoSearchList:","error: parsing generalMonitor XML.")
            except ZeroDivisionError:
                loginf("CalduinoSearchList:","error: ZeroDivisionError parsing generalMonitor XML.")

            try:            
                # analyzing pollCalduino                
                tree = ET.parse(self.xml_source_dir + "pollMonitor.xml")
                root = tree.getroot()
                
                self.search_list_extension['opOKPoll'] = int(root[0].text)
                self.search_list_extension['opNOKPoll'] = int(root[1].text)                
                self.search_list_extension['opLastTimePoll'] = int(root[2].text)                        
                self.search_list_extension['opMeanTimePoll'] = float(root[3].text)

            except IOError:
                loginf("CalduinoSearchList:","error: cannot find pollMonitor XML.")
            except (ET.ParseError, IndexError):
                loginf("CalduinoSearchList:","error: parsing pollMonitor XML.")
            except ZeroDivisionError:
                loginf("CalduinoSearchList:","error: ZeroDivisionError parsing pollMonitor XML.")            
        
        return [self.search_list_extension]