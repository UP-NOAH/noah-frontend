from tornado import websocket, gen, web
import json, tornadoredis, datetime, traceback, redis
from config import *
from sensor_data_parser import get_station_data

class SensorWebsocketHandler(websocket.WebSocketHandler):
	def open(self,type_id,station_id):
		self.type_id, self.station_id = type_id,station_id

		self.client = tornadoredis.Client()
		self.client.connect()

		key =  SENSOR_REDIS_KEY.format(type_id=type_id,station_id=station_id)
		print "WebSocket opened"
		print key
		data = self.db_get_(key)
		data = None
		if not data == None:
			try:
				data = json.loads(data)
			except ValueError:
				traceback.print_exc()
				data = {}
		else:
			data = json.loads(get_station_data(key))
			#print data

		self.write_message(json.dumps(data))

	def db_get_(self,key):
		try:
			r_conn = redis.StrictRedis()
			return r_conn.get(key)
		except:
			raise redis.RedisError
			#return None

	#def on_message(self, message):
	#	self.write_message("You fucking said: "+self.type_id+self.station_id)
	#def on_close(self):
	#	print("Websocket closed")