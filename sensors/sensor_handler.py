import json

from config import BACKEND_URL, SENSOR_URL
from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
from exceptions import *

class SensorHandler(JSONHandler):
    def arrange_sensor_data(self, sensor):
        station_info = {}
        stations = []

        for station in sensor['stations']:
            if station['lat'] != 0 or station['lng'] != 0:
                stations.append({
                    "lat": station['lat'],
                    "lng": station['lng'],
                    "url": station['url'],
                    "name": station['verbose_name'],
                    "id": station['station_id']
                })

        station_info['name'] = sensor['verbose_name']
        station_info['icon'] = sensor['icon']
        station_info['type'] = sensor['type_id']
        station_info['data'] = stations

        return station_info

    @web.asynchronous
    @gen.coroutine
    def get(self, url):
        try:
            data = self.retrieve_data()
            section_data = {}
            section_data['tag'] = "sensors"

            try:
                result = yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + "stations")
                print result
                station_data = json.loads(result.body)["data"]

            except web.MissingArgumentError:
                pass

            finally:
                if (url == "all"):
                    for component in data['components']:
                        if component['component_tag'] == 'sensors':
                            section_data['title'] = component['component_name']
                            section_data['sections'] = component['component_data']
                            section_data['desc'] = component['component_desc']
                    response = section_data

                else:
                    type_id = SENSOR_URL[url]
                    
                    for sensor in station_data:
                        if (type_id == sensor["type_id"]):
                            sensor_data = self.arrange_sensor_data(sensor)
                            response = sensor_data
                            break

        except:
            e = BaseException()
            response = self.get_error_msg(e.error_msg, e.error_code)

        else:
            response.update({'success': True})

        finally:
            self.write(json.dumps(response))


    