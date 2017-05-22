import json, urllib2

from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
from config import BACKEND_URL, WEATHER_OUTLOOK, TRACK_URL, API_URL

class WeatherHandler(JSONHandler):

    # This appends data to every section in a component
    #
    def append_record(self, data_record):
        records = []
        desclist = {}
        desclist['Temperature Contour'] = 'Estimated temperature based on readings of Automatic Weather Stations'
        desclist['Pressure Contour'] = 'Estimated pressure based on Automatic Weather Stations pressure readings'
        desclist['Humidity Contour'] = 'Estimated humidity based on Automatic Weather Stations humidity measurements'
        desclist['1-hour Rainfall Contour'] = 'Estimated rainfall distribution in the past hour based on rainfall measurements by Automatic Weather Stations and Rain Gauges'
        desclist['3-hour Rainfall Contour'] = 'Estimated rainfall distribution in the past 3 hours based on rainfall measurements by Automatic Weather Stations and Rain Gauges'
        desclist['6-hour Rainfall Contour'] = 'Estimated rainfall distribution in the past 6 hours based on rainfall measurements by Automatic Weather Stations and Rain Gauges'
        desclist['12-hour Rainfall Contour'] = 'Estimated rainfall distribution in the past 12 hours based on rainfall measurements by Automatic Weather Stations and Rain Gauges'
        desclist['24-hour Rainfall Contour'] = 'Estimated rainfall distribution in the past 24 hours based on rainfall measurements by Automatic Weather Stations and Rain Gauges'
        desclist['Weather Satellite Image'] = 'Multi-functional Transport Satellite (MTSAT) image from Japan courtesy of PAGASA; Infrared image showing cloud formations'
        desclist['Black and White Image'] = 'Processed MTSAT; Processed infrared image showing clouds with low temperature'
        desclist['Visible Satellite Image'] = 'MTSAT Vis; Actual satellite image of clouds (image is only visible during the day)'


        for record in data_record:
                try:
                    records.append({
                        "sub_section_name": record["verbose_name"],
                        "sub_section_extent": record["extent"],
                        "sub_section_url": record["url"],
                        "sub_section_image_size": record["size"],
                        "sub_section_desc": desclist[record["verbose_name"]]
                    })
                except:
                    records.append({
                        "sub_section_name": record["verbose_name"],
                        "sub_section_extent": record["extent"],
                        "sub_section_url": record["url"],
                        "sub_section_image_size": record["size"],
                        "sub_section_desc": ''
                    })

        return records

    @web.asynchronous
    @gen.coroutine
    def get(self, section):
        try:
            data = self.retrieve_data()
            section_data = {}
            section_data['tag'] = "weather"
            contour_data = []
            doppler_data = []
            satellite_data = []

            try:
                latest = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + "weather/latest_contour"))).body)
            #  cumulative = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + "weather/cumulative_rainfall"))).body)
                doppler = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + "weather/doppler"))).body)
                satellite = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + "weather/mtsat"))).body)

            except web.MissingArgumentError:
                pass

            finally:
                for component in data['components']:
                    if component['component_tag'] == 'weather':
                        if (section == "all"):
                            section_data['title'] = component['component_name']
                            section_data['sections'] = component['component_data']
                            section_data['desc'] = component['component_desc']

                        elif (section == "contours"):
                          #  contour_data.extend(self.append_record(cumulative['data']))
                            contour_data.extend(self.append_record(latest['data']))

                            section_data['name'] = "Contour"
                            section_data['data'] = contour_data

                        elif (section == "dopplers"):
                            doppler_data.extend(self.append_record(doppler['data']))

                            section_data['name'] = "Doppler Stations"
                            section_data['data'] = doppler_data

                        elif (section == "satellites"):
                            satellite_data.extend(self.append_record(satellite['data']))

                            section_data['name'] = "Satellite"
                            section_data['data'] = satellite_data

                        elif (section == "weatheroutlook"):
                            section_data['name'] = "Weather Outlook"
                            section_data['data'] = WEATHER_OUTLOOK

                        else:
                            section_data = self.check_data(section, component)

                response = section_data

        except:
            e = BaseException()
            response = self.get_error_msg(e.error_msg, e.error_code)

        else:
            response.update({'success': True})

        finally:
            self.write(json.dumps(response))


class ForecastHandler(web.RequestHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self, url):
        try:
            data = {}

            try:
                forecast = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + 'weather/' + url))).body)

            except web.MissingArgumentError:
                pass

            finally:
                data['data'] = forecast['data']
                response = data

        except:
            e = BaseException()
            response = self.get_error_msg(e.error_msg, e.error_code)

        else:
            response.update({'success': True})

        finally:
            self.write(json.dumps(response))

class StormTrackHandler(web.RequestHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self):
        try:
            data = {}

            try:
                forecast = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, TRACK_URL+'current/json'))).body)
            except web.MissingArgumentError:
                pass

            finally:
                data['data'] = forecast
                response = data

        except:
            e = BaseException()
            response = self.get_error_msg(e.error_msg, e.error_code)

        else:
            response.update({'success': True})

        finally:
            self.write(json.dumps(response))

class SevenDayWeatherHandler(web.RequestHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self,id):
        try:
            print id
            forecast = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, API_URL + 'api/seven_day_forecast/' + id))).body)
            response = forecast

            for datum in response['data']:
                for r in datum['readings']:
                    if float(r['rainfall']) == 0.0 and r['icon'][0] == 'R':
                        r['rainfall'] = 0.1

        except:
            e = BaseException()
            response = self.get_error_msg(e.error_msg, e.error_code)

        finally:
            self.write(json.dumps(response))