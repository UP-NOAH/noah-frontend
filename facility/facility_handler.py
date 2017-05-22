import json

from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
import traceback
from config import *

class FacilityHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self, section):
        data = self.retrieve_data()
        section_data = {}
        section_data['tag'] = "facility"
        #section_data['tag'] = section
        response = {}
        section_dict = {'schools':('Schools','facility/schools'),
                        'policestations':('Police Stations','facility/policestations'),
                        'healthfacilities':('Health Facilities','facility/healthfacilities'),
                        'firestations':('Fire Stations','facility/firestations')
                        }
        try:
            for component in data['components']:
                if component['component_tag'] == 'facility':
                    if (section == 'all'):
                        section_data['title'] = component['component_name']
                        section_data['sections'] = component['component_data']
                        section_data['sections'] = component['component_data']

                    elif (section == 'schools' or section == 'policestations' or 'healthfacilities' or 'firestations'):
                        subsection = self.get_section(component['component_data'],section)
                        data = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + section_dict[section][1]))).body)
                        if data['success']:
                            section_data['name'] = section_dict[section][0]      #used in the Template and filename of Icons
                            section_data['features'] = data['data']
                            section_data['desc'] = subsection['section_desc']
                            section_data['source'] = subsection['section_source']
                            #print section_data
                        else:
                            raise Exception
                    else:
                        #print component['component_data']
                        subsection = self.get_section(component['component_data'],section)
                        #print "wew"
                        section_data['name'] = subsection['section_name']
                        section_data['layer'] = subsection["section_data"]
                        section_data['desc'] = subsection['section_desc']

            response = section_data
        except Exception, e:
            print e.message
            response = traceback.print_exc()
        finally:
            self.write(json.dumps(response))

    def get_section(self,data,tag):
        for datum in data:
            if datum['section_tag'] == tag:
                return datum