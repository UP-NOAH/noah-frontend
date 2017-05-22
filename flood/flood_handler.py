import json

from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
from config import BACKEND_URL, YEAR_LIST
from exceptions import *

class FloodHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self, section):
        try:
            data = self.retrieve_data()
            section_data = {}
            section_data['tag'] = "flood"
            flood_data = []
            response = {}

            try:
                floods = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + 'floods/all'))).body)

            except web.MissingArgumentError:
                pass

            finally:
                for component in data['components']:
                    if component['component_tag'] == 'flood':

                        if (section == 'all'):
                            section_data['title'] = component['component_name']
                            section_data['sections'] = component['component_data']
                            section_data['desc'] = component['component_desc']

                        elif (section == 'floodhazards'):
                            flood_data = self.arrange_layer_data(floods['data'])

                            section_data['name'] = "Flood Hazards"
                            section_data['data'] = flood_data

                        elif (section == 'floodreports'):

                            str_year_list = []
                            for year in YEAR_LIST:
                                str_year_list.append({
                                        "sub_section_name": str(year)
                                    })

                            section_data['name'] = "Flood Reports"
                            section_data['data'] = str_year_list

                response = section_data

        except:
            e = BaseException()
            response = self.get_error_msg(e.error_msg, e.error_code)

        else:
            response.update({'success': True})

        finally:
            self.write(json.dumps(response))


class FloodReportsHandler(web.RequestHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self, **args):
        try:
            year = args['year']
            data = {}

            try:
                reports = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + 'reports/flood/' + year))).body)

            except web.MissingArgumentError:
                pass

            finally:
                data['data'] = reports['data']
                response = data

        except:
            e = BaseException()
            response = self.get_error_msg(e.error_msg, e.error_code)

        else:
            response.update({'success': True})

        finally:
            self.write(json.dumps(response))
