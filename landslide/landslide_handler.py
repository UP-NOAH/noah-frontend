import json

from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
from config import BACKEND_URL, LANDSLIDE_URL
from exceptions import *

class LandslideHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self, section):
        try:
            data = self.retrieve_data()
            section_data = {}
            section_data['tag'] = 'landslide'
            landslide_data = {}
            response = {}

            try:
                if (section != "all"):
                    landslide_data = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + 'landslides/type/' + str(LANDSLIDE_URL[section])))).body)
                    landslides = landslide_data['data']

            except web.MissingArgumentError:
                pass

            finally:
                if (section == "all"):
                    for component in data['components']:
                        if component['component_tag'] == 'landslide':
                            section_data['title'] = component['component_name']
                            section_data['sections'] = component['component_data']
                            section_data['desc'] = component['component_desc']
                            break

                else:
                    section_data['id'] = landslides['type_id']
                    section_data['landslide'] = landslides['layers']
                    section_data['name'] = landslides['verbose_name']

                response = section_data

        except:
            e = BaseException()
            response = self.get_error_msg(e.error_msg, e.error_code)

        else:
            response.update({'success': True})

        finally:
            self.write(json.dumps(response))