import json

from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
from config import BACKEND_URL
from exceptions import *

class StormSurgeHandler(JSONHandler):

    def arrange_stormsurge_data(self, stormsurge_data):
        new_stormsurge_data = []

        for event in stormsurge_data:
            new_stormsurge_data.append({
                "id": event["type_id"],
                "layers": event["layers"],
                "name": event["verbose_name"]
            })

        return new_stormsurge_data

    @web.asynchronous
    @gen.coroutine
    def get(self, section):
        try:
            data = self.retrieve_data()
            section_data = {}
            section_data['tag'] = 'stormsurge'
            response = {}
            advisory_data = {}
            new_advisory_data = []

            try:
                advisory_data = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + 'storm_surges/all'))).body)

            except web.MissingArgumentError:
                pass

            finally:
                for component in data['components']:
                    if component['component_tag'] == 'stormsurge':
                        if (section == 'all'):
                            section_data['title'] = component['component_name']
                            section_data['sections'] = component['component_data']
                            section_data['desc'] = component['component_desc']

                        elif (section == 'historymap'):
                            section_data['name'] = "Historical Inundation Maps"
                            section_data['data'] = []

                        elif (section == 'historysim'):
                            section_data['name'] = "Historical Simulations"
                            section_data['data'] = []

                        elif (section == 'observeptsforecast'):
                            section_data['name'] = "Observation Point Forecast"
                            section_data['data'] = []

                        elif (section == 'probablexceed'):
                            section_data['name'] = "Probability of Exceedance"
                            section_data['data'] = []

                        elif (section == 'regionalforecast'):
                            section_data['name'] = "Regional Forecast"
                            section_data['data'] = []

                        elif (section == 'ssadvisory'):
                            new_advisory_data = self.arrange_layer_data(advisory_data['data'])

                            section_data['name'] = "Storm Surge Advisory"
                            section_data['data'] = new_advisory_data


                response = section_data

        except:
            e = BaseException()
            response = self.get_error_msg(e.error_msg, e.error_code)

        else:
            response.update({'success': True})

        finally:
            self.write(json.dumps(response))