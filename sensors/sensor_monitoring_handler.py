import tornado.web

class SensorMonitoringHandler(tornado.web.RequestHandler):
    def get(self):
        self.redirect("http://202.90.159.176:1818")