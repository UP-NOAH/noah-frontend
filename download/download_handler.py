import json, time, hashlib, urllib
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient, HTTPRequest
from config import BACKEND_URL
from handlers.json_handler import BaseHandler

class DownloadHandler(BaseHandler):
    @web.asynchronous
    @gen.coroutine
    def get(self):
    	print "GEOSERVER_LAYER:", self.get_argument("geoserver_layer")
        if self.get_current_user() and self.get_current_user() != 'public':
            auth_key = self.get_secure_cookie("auth_key")
            response = {"sucess":True}
            self.write(json.dumps(response))