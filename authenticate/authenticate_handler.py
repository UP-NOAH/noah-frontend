import json, time, hashlib, urllib
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient, HTTPRequest
from config import BACKEND_URL

from handlers.json_handler import BaseHandler

class AuthHandler(BaseHandler):
    @web.asynchronous
    @gen.coroutine
    def post(self):
        auth_url = BACKEND_URL + 'authenticate'
        username = self.get_argument("username")
        password = self.get_argument("password")
        hash_object = hashlib.sha256(password).hexdigest()
        if username and password:
            data = {'username': username, 'password': hash_object}
            body = urllib.urlencode(data)
            req = HTTPRequest(auth_url, method='POST', body=body, request_timeout=20000)
            try:
                auth_resp = yield gen.Task(AsyncHTTPClient().fetch, req)
                json_resp = json.loads(auth_resp.body)
                if json_resp["success"]:
                    auth_key = json_resp["user_data"]["auth_key"]
                    self.set_secure_cookie("auth_key", auth_key, expires_days=1)
                    self.set_secure_cookie("NOAHSESSIONID", username, expires_days=1)
                    self.redirect(self.request.headers.get('Referer').split('?')[0])

                else:
                    self.redirect(self.request.headers.get('Referer').split('?')[0])
            except:
                raise

class LogoutHandler(BaseHandler):
    @web.asynchronous
    @gen.coroutine
    def get(self):
        self.clear_cookie("NOAHSESSIONID")
        self.set_secure_cookie("NOAHSESSIONID", 'public', expires_days=2)
        self.redirect(self.request.headers.get('Referer').split('?')[0])