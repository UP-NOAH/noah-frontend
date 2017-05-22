import json

from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
from config import BACKEND_URL
from exceptions import *

class ExposeVulnerableHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self, section):
        data = self.retrieve_data()
        section_data = {}
        section_data['tag'] = "exposevulnerable"
        response = {}

        for component in data['components']:
            if component['component_tag'] == 'exposevulnerable':
                if (section == 'all'):
                    section_data['title'] = component['component_name']
                    section_data['sections'] = component['component_data']
                    section_data['desc'] = component['component_desc']

                elif (section == 'census'):
                    section_data['name'] = "Census"
                    section_data['data'] = []

                elif (section == 'critical'):
                    section_data['name'] = "Critical Facilities"
                    section_data['data'] = []

                elif (section == 'roadsbridges'):
                    section_data['name'] = "Roads and Bridges"
                    section_data['data'] = []

        response = section_data

        self.write(json.dumps(response))