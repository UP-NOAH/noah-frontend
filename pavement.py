from sys import path
from os import path as pth

from paver.easy import *
from screenutils import list_screens, Screen
from json import dumps

PORTS = [8080, 8081, 8082, 8083]
TORNADO_SCREEN = 'tornado_{port}'

@task
def start_tornado():
	for port in PORTS:
		s = Screen(TORNADO_SCREEN.format(port=port))
		if s.exists is False:
			s.initialize()
			s.send_commands('python main.py --port={port}'.format(port=port))
	info('Starting tornado instance(s) in port(s) {ports}'.format(ports=dumps(PORTS)))

@task
def stop_tornado():
	for port in PORTS:
		s = Screen(TORNADO_SCREEN.format(port=port))
		if s.exists:
			s.interrupt()
			s.kill()
	info('Stopping tornado instance(s).')

@task
@needs([
	'start_tornado'
])
def start():
	info('NOAH Frontend started.')

@task
@needs([
	'stop_tornado'
])
def stop():
	info('NOAH Frontend stopped.')

@task
@needs([
	'stop',
	'start'
])
def restart():
	info('NOAH Frontend restarted.')

