import json

from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
from config import BACKEND_URL
from exceptions import *

class HealthHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self, section):
        data = self.retrieve_data()
        section_data = {}
        section_data['tag'] = "health"
        response = {}

        for component in data['components']:
            if component['component_tag'] == 'health':
                if (section == 'all'):
                    section_data['title'] = component['component_name']
                    section_data['sections'] = component['component_data']
                    section_data['desc'] = component['component_desc']

                elif (section == 'dengue'):
                    section_data['name'] = "Ovitrap Index"
                    section_data['data'] = []

                elif (section == 'leptos'):
                    section_data['name'] = "Leptospirosis"
                    section_data['data'] = []

        response = section_data

        self.write(json.dumps(response))

