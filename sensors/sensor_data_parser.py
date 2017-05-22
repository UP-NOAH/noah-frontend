import traceback, redis
import time
import sys, os
sys.path.append(os.path.join(os.path.abspath(os.path.dirname(__file__)), '..'))
__author__ = 'jed'
# Script to fetch sensor data from Backend to redis, run every 10 minutes
import urllib2, json, websocket, logging, filelock
from config import *


def db_store_(key, value):
	try:
		r_conn = redis.StrictRedis()
		r_conn.set(key, value)
		print "Stored in " + key
	except:
		raise redis.RedisError


def get_all_sensor_url():
	station_urls = []

	all_sensors = urllib2.urlopen(BACKEND_URL + 'stations')
	sensor_dict = json.loads(all_sensors.read())
	station_type_list = sensor_dict['data']
	for type in station_type_list:
		for station in type['stations']:
			station_urls.append(station['url'])

	return station_urls


def get_station_data(station_url):
	try:
		if BACKEND_URL[-5:] != "8000/":
			ws_station_url = BACKEND_URL[:-1].replace('http:', 'ws:') + ":8000" + station_url
		else:
			ws_station_url = BACKEND_URL[:-1].replace('http:', 'ws:') + station_url
		# print station_url
		print "connecting to " + ws_station_url

		ws = websocket.create_connection(ws_station_url)
		data = ws.recv()
		# print data
		print "Successfully established connection at " + ws_station_url
		# db_store_(station_url,data)

		ws.close()
		return data

	except Exception:
		# PLEASE CREATE LOGGER
		traceback.print_exc()
		return ''


def main():
	station_urls = get_all_sensor_url()

	# iterate urls and get data
	for url in station_urls:
		data = get_station_data(url)
		i = 0
		for i in range(3):
			if data != '':
				print data
				db_store_(url, data)
				print "Successful fetching " + url
				break
			else:
				print "retrying " + url
				time.sleep(3)
		if i >= 3:
			logger.error("failed to fetch new data for "+url)
def create_logger(fname):
	global logger
	logger = logging.getLogger(__name__)
	logger.setLevel(logging.INFO)

	#create file handler
	path = os.path.abspath(__file__)
	dir_path = os.path.dirname(path)
	lpath = os.path.join(dir_path,'logs')
	if not os.path.exists(lpath):
			os.makedirs(lpath)

	fname = os.path.join(lpath,fname)
	handler = logging.FileHandler(fname)
	handler.setLevel(logging.INFO)

	#create logigng format
	formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
	handler.setFormatter(formatter)

	logger.addHandler(handler)

if __name__ == '__main__':
	dir_path = os.path.dirname(os.path.abspath(__file__))
	lock_file = filelock.FileLock(os.path.join(dir_path, "sensor_daily_parser_lock"))
	lock_file.timeout = 10
	file = os.path.basename(__file__)
	create_logger(file.replace('.py', '.log'))

	initialTime = time.strftime("%H:%M:%S")
	logger.info("Started at "+initialTime)
	try:
		assert lock_file.acquire()
		print "Lock file acquired!"
		logger.info("Lock file acquired!")
	except:
		print "File is locked, program exiting!"
		logger.error("File is locked, program exiting!")
		sys.exit()
	main()
	endTime = time.strftime("%H:%M:%S")
	logger.info("Ended at "+endTime)

