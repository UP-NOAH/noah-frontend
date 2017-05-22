import os, json, traceback
from datetime import date

from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
from json_handler import JSONHandler, BaseHandler
from config import GEOSERVER_URL, SIDEBAR_DATA_URL, AUTH_URL, LINKS, BACKEND_URL#, MAPBOX_DATA_URL

class IndexHandler(BaseHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self):
        # result = yield gen.Task(AsyncHTTPClient().fetch, AUTH_URL)
        # cookie_data = json.loads(result.body)["user_data"]

        # cookie = []
        # cookie = cookie_data['geoserver_cookie'].split('=')

        if self.get_current_user() and self.get_current_user() != 'public':
            self.render("index.html", name=self.get_current_user())
        else:
            self.set_secure_cookie("NOAHSESSIONID", "public", expires_days=None)
            self.render("index.html", name=None)

        # if not self.get_current_user():
        #     # self.get_cookie(cookie[0]) and
        #     # self.set_cookie(cookie[0].upper(), cookie[1], path='/geoserver/', domain=GEOSERVER_URL.replace('http://', ''))
        #     self.set_secure_cookie("NOAHSESSIONID", "public", expires_days=None)

        # self.render("index.html")
    def head(self):
        self.finish()

class SidebarHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self):
        data = self.retrieve_icons()

        self.write(json.dumps(data))

# class MapboxLayerHandler(JSONHandler):
#
#     @web.asynchronous
#     @gen.coroutine
#     def get(self):
#         data = self.retrieve_data()
#
#         self.write(json.dumps(data))
#     def retrieve_data(self):
#         with open(MAPBOX_DATA_URL) as json_file:
#             json_data = json.load(json_file)


#        return json_data
class ComponentLinksHandler(web.RequestHandler):

	@web.asynchronous
	@gen.coroutine
	def get(self):
		self.write(json.dumps(LINKS))

class SplashHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self, location):
        try:
            print location
            forecast = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + 'weather/rain_forecast'))).body)
            forecast_data = forecast['data']
            for forecast in forecast_data:
                #print forecast['location']
                if (location == forecast['location']) and forecast['data'] != []:
                    response = forecast
                    response["date_today"] = date.today().strftime("%b %d, %A"),
                    break
                else:
                    response = {
                        "date_today": date.today().strftime("%b %d, %A"),
                        "temperature": 'n/a',
                        "last_update": forecast['last_update'],
                        "source": "ClimateX.PH",
                        "location": location,
                        "lat": "n/a",
                        "lng": "n/a",
                        "data": [
                            {
                                "percent_chance_of_rain": "No available data",
                                "chance_of_rain": "-----",
                                "icon": "http://nababaha.appspot.com/static/img/30.png",
                                "time": "-----"
                            },
                            {
                                "percent_chance_of_rain": "No available data",
                                "chance_of_rain": "-----",
                                "icon": "http://nababaha.appspot.com/static/img/30.png",
                                "time": "-----"
                            },
                            {
                                "percent_chance_of_rain": "No available data",
                                "chance_of_rain": "-----",
                                "icon": "http://nababaha.appspot.com/static/img/30.png",
                                "time": "-----"
                            },
                            {
                                "percent_chance_of_rain": "No available data",
                                "chance_of_rain": "-----",
                                "icon": "http://nababaha.appspot.com/static/img/30.png",
                                "time": "-----"
                            }
                        ]
                    }

            
        except:
            traceback.print_exc()
            e = BaseException()
            response = self.get_error_msg(e.error_msg, e.error_code)
        finally:
            self.write(json.dumps(response))


