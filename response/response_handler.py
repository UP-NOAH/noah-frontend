import json

from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient

class ResponseHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self, section):
        data = self.retrieve_data()


        for component in data['components']:
            if component['component_tag'] == 'response':
                section_data = self.check_data(section, component)

        response = section_data

        return self.write(json.dumps(response))