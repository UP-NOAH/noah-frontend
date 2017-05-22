import json

from handlers.json_handler import JSONHandler
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
from config import BACKEND_URL
from exceptions import *

class LocationsHandler(JSONHandler):

	@web.asynchronous
	@gen.coroutine
	def get(self, location):
		try:
			response = {}
			if location == 'municipals':
				location = 'muncities'

			try:
				data = json.loads(((yield gen.Task(AsyncHTTPClient().fetch, BACKEND_URL + 'locations/' + location))).body)
			
			except web.MissingArgumentError:
				pass
			
			finally:
				response['data'] = self.check_locations(location, data['data'])

		except:
			e = BaseException()
			response = self.get_error_msg(e.error_msg, e.error_code)

		else:
			response.update({'success': True})

		finally:
			self.write(json.dumps(response))