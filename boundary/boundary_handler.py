import json

from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
import traceback

class BoundaryHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self, section):
        data = self.retrieve_data()
        section_data = {}
        section_data['tag'] = "boundary"
        #section_data['tag'] = section
        response = {}

        try:
            for component in data['components']:
                if component['component_tag'] == 'boundary':
                    if (section == 'all'):
                        section_data['title'] = component['component_name']
                        section_data['sections'] = component['component_data']
                        section_data['sections'] = component['component_data']

                    #elif (section == 'province'):
                    else:
                        #print component['component_data']
                        subsection = self.get_section(component['component_data'],section)
                        print "wew"
                        section_data['name'] = subsection['section_name']
                        section_data['layer'] = subsection["section_data"]
                        section_data['desc'] = subsection['section_desc']

            response = section_data
        except Exception, e:
            print e.message
            response = traceback.print_exc()
        return self.write(json.dumps(response))

    def get_section(self,data,tag):
        for datum in data:
            if datum['section_tag'] == tag:
                return datum