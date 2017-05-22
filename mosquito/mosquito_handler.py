import json

from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
import traceback
from config import *

class MosquitoHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self,section):
        response = {}
        data = self.retrieve_data()
        section_data = {}
        try:
            for component in data['components']:
                if component['component_tag'] == 'mosquito':
                    if section == "all":
                        section_data['title'] = component['component_name']
                        section_data['sections'] = component['component_data']
                        #section_data['sections'] = component['component_data']
                        response = section_data
                    else:
                        data = json.loads((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + "mosquito")).body)

                        section_data['name'] = component['component_data'][0]['section_name']
                        section_data['desc'] = component['component_data'][0]['section_desc']
                        section_data['tag'] = component['component_data'][0]['section_tag']
                        section_data['source'] = component['component_data'][0]['section_source']
                        section_data['features'] = data['data']
                        response = section_data
            # FOR TESTING response = json.loads((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + "stations")).body)
        except Exception, e:
            print e.message
            response = traceback.print_exc()
        finally:
            self.write(json.dumps(response))