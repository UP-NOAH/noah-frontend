import tornado.web

class TrackHandler(tornado.web.RequestHandler):
    def get(self):
        self.redirect("http://202.90.159.176:8900")