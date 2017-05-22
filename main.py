import tornado.httpserver
import tornado.ioloop
import tornado.web
import os
import sys

from tornado.options import define, options
from config import COOKIE_SECRET
from handlers.handlers import *
from handlers.menu_handlers import MenuTemplateHandler, AboutPageHandler
from modules import NavbarModule
from boundary.boundary_handler import BoundaryHandler
from facility.facility_handler import FacilityHandler
from earthquake_volcano.earth_volcano_handler import EarthVolcanoHandler
from exposure_vulnerable.exposure_vulnerable_handler import ExposeVulnerableHandler
from flood.flood_handler import *
#from mapbox.mapbox_handler import MapboxHandler
from geoserver.geoserver_handler import GeoserverHandler
from landslide.landslide_handler import LandslideHandler
from locations.locations_handler import LocationsHandler
from response.response_handler import ResponseHandler
from storm_surge.storm_surge_handler import StormSurgeHandler
from weather.weather_handler import *
from weather.ticker_handler import *
from authenticate.authenticate_handler import AuthHandler, LogoutHandler
from sensors.sensor_handler import SensorHandler
from sensors.sensor_websocket_handler import SensorWebsocketHandler
from websafe.websafe_handler import *
from websafe.websafedoc_handler import *
from health.health_handler import HealthHandler
from download.download_handler import DownloadHandler
from mosquito.mosquito_handler import MosquitoHandler
from storm_track.storm_track_handler import TrackHandler
from sensors.sensor_monitoring_handler import SensorMonitoringHandler
from prins.prins_handler import PrinsHandler
from prins.prins_wrf_handler import PrinsWrfHandler
from weather.weather_handler import SevenDayWeatherHandler

define("port", default=8080, help="run on the given port", type=int)

settings = dict(
	template_path=os.path.join(os.path.dirname(__file__), "templates"),
	static_path=os.path.join(os.path.dirname(__file__), "static"),
	debug=True,
    ui_modules = {'Navbar': NavbarModule},
    cookie_secret=COOKIE_SECRET
)

application = tornado.web.Application([
		(r'/noahapi/(menulevel1|menulevel2)', MenuTemplateHandler),
        (r'/p/(about|login)', AboutPageHandler),
		(r'/flood/(all|floodhazards|floodreports|flood5)', FloodHandler),
        (r'/flood/reports/(?P<year>[\d]{4})', FloodReportsHandler),
		(r'/weather/(all|contours|dopplers|riverinundations|satellites|sensors|tidelevels|weatheroutlook)', WeatherHandler),
        (r'/weather/(rain_forecast|four_day_forecast|seven_day_forecast)', ForecastHandler),
        (r'/weather/storm_track', StormTrackHandler),
		(r'/earthvolcano/(all|earthquake|volcano|tectonic)', EarthVolcanoHandler),
		#(r'/landslide/(all|alluvial|hazards|debris|unstable)', LandslideHandler),
        (r'/landslide/(all|alluvial|hazards|unstable)', LandslideHandler),
		#(r'/stormsurge/(all|historymap|historysim|observeptsforecast|regionalforecast|probablexceed|ssadvisory)', StormSurgeHandler),
        (r'/stormsurge/(all|ssadvisory)', StormSurgeHandler),
        (r'/exposevulnerable/(all|census|critical|roadsbridges)', ExposeVulnerableHandler),
		(r'/response/(all|reports|rescuemap|rescuetrack)', ResponseHandler),
		(r'/boundary/(all|province|municipality|baranggay|riverbasin)', BoundaryHandler),
        (r'/facility/(all|policestations|schools|healthfacilities|firestations)', FacilityHandler),
        (r'/sensors/(all|tide|asg|arg|aws|rwl)', SensorHandler),
        (r'/station/(\d+)/(\d+)', SensorWebsocketHandler),
        (r'/location/(regions|provinces|municipals)', LocationsHandler),
        (r'/health/(all|dengue|leptos)', HealthHandler),
        (r'/sidebar', SidebarHandler),
        #(r'/mapbox_layers', MapboxLayerHandler),
        #(r'/mapbox/(.*)', MapboxHandler),
        (r'/geoserver/(.*)', GeoserverHandler),
		(r'/links', ComponentLinksHandler),
        (r'/auth', AuthHandler),
        (r'/logout', LogoutHandler),
        (r'/ticker', TickerHandler),
        (r'/websafe', WebsafeHandler),
        (r'/websafe/profile', WebsafeProfileHandler),
        (r'/websafe/hazards', WebsafeHazardListHandler),
        (r'/websafe/data', WebsafeDataHandler),
        (r'/websafe/additionaldata', WebsafeAdditionalDataHandler),
        (r'/websafe/docs/(?P<document>.*)', WebsafeDocHandler),
        (r'/websafe/docs/?', DocListHandler),
        (r'/calculate', CalculateHandler),
        (r'/exposures', ExposureListHandler),
        (r'/hazards', HazardListHandler),
        (r'/download', DownloadHandler),
        (r'/showpdf', PDFHandler),
        (r'/splash/(.*)', SplashHandler),
        (r'/websafedata', StatusPageHandler),
        (r'/mosquito/(all|ovindex)', MosquitoHandler),
        (r'/stormtrack', TrackHandler),
        (r'/sensor-monitoring', SensorMonitoringHandler),
        (r'/prins', PrinsHandler),
        (r'/prins-wrf', PrinsWrfHandler),
        (r'/sevenday/(\d+)', SevenDayWeatherHandler),
        (r'/', IndexHandler)
	], **settings
)

if __name__ == "__main__":
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(application, xheaders=True)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
