import json

from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
from config import BACKEND_URL, YEAR_LIST
from exceptions import *

class GeoserverHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self, section):
        try:
            data = self.retrieve_data()
            section_data = {}
            response = {}
            # for component in data['components']:
            #     if component['component_tag'] == 'landslide':
            #         print section
            #         if ('landslide' in section ):
            #             section_data['name'] = component['component_name']
            #             component_data = component['component_data']
            #             section_data['layer'],section_data['desc'] = self.get_layer(component_data,section)
            #             section_data['tag'] = "landslide"
			#
            #     response = section_data
            if "landslide" in section:
                component = self.find_component(data,section)
                subsection = self.find_section(component,section)
                section_data['name'] = subsection['section_name']
                section_data['desc'] = subsection['section_desc']
                section_data['layer'] = subsection['section_data']
                section_data['tag'] = "landslide"

            elif "stormsurge" in section:
                #print section
                component = self.find_component(data,section)
                subsection = self.find_section(component,section)
                section_data['name'] = subsection['section_name']
                section_data['desc'] = subsection['section_desc']
                section_data['layer'] = subsection['section_data']
                print section_data['layer']
                section_data['tag'] = "stormsurge"

            elif "flood" in section:
                #print section
                component = self.find_component(data,section)
                subsection = self.find_section(component,section)
                section_data['name'] = subsection['section_name']
                section_data['desc'] = subsection['section_desc']
                section_data['layer'] = subsection['section_data']
                print section_data['layer']
                section_data['tag'] = "flood"

            response = section_data
        except:
            e = BaseException()
            response = self.get_error_msg(e.error_msg, e.error_code)

        else:
            response.update({'success': True})

        finally:
            self.write(json.dumps(response))

    def get_layer(self,component_data,section):
        for component_datum in component_data:
            if component_datum['section_tag'] == section:
                return component_datum['section_data'], component_datum["section_desc"]
        return ""

    def find_component(self,data,section):
        #print data
        for component in data["components"]:
            if component['component_tag'] in section:
                return component
        return {}

    def find_section(self,component,section):
        sections = component["component_data"]
        for s in sections:
            if s["section_tag"] == section:
                return s
        return {}