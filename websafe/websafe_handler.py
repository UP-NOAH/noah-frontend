import os, json, time, urllib
import traceback

from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient, HTTPRequest
from handlers.json_handler import JSONHandler
from config import GEOSERVER_URL, BACKEND_URL, ROOT
from weasyprint import HTML, CSS

class WebsafeHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self):
        self.render("menu/websafe.html")

class StatusPageHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self):
        self.render("status.html",name=self.get_current_user() if self.get_current_user() != 'public' else None)

class ExposureListHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self):
        to_return = []
        exposures_url = BACKEND_URL + 'exposures'
        muncities_url = BACKEND_URL + 'locations/muncities'
        try:
            exposures_resp = yield gen.Task(AsyncHTTPClient().fetch, exposures_url)
            exposures_json = json.loads(exposures_resp.body)
            muncities_resp = yield gen.Task(AsyncHTTPClient().fetch, muncities_url)
            muncity_json = json.loads(muncities_resp.body)

            if exposures_json['success'] == True and muncity_json['success'] == True:
                exposures_data = exposures_json['data']
                muncity_data = muncity_json['data']

                for json_data in exposures_data:
                    temp = {}
                    temp['category'] = json_data['verbose_name']
                    temp['type_id'] = json_data['exposure_id']
                    temp['layer_array'] = []

                    for exposure in json_data['exposure']:
                        temp_exp_data = {}
                        temp_exp_data['id'] = json_data['exposure_id']
                        temp_exp_data['psgc'] = exposure['mun_city_psgc']
                        temp_exp_data['center'] = exposure['center']
                        temp_exp_data['resource_name'] = exposure['geoserver_layer']

                        for muncity in muncity_data:
                            if muncity['mun_city_psgc'] == temp_exp_data['psgc']:
                                temp_exp_data['verbose_name'] = muncity['verbose_name']

                        temp['layer_array'].append(temp_exp_data)

                    temp['layer_array'] = sorted(temp['layer_array'], key=lambda k: k['verbose_name'])
                    to_return.append(temp)

                self.write(json.dumps(to_return))
            else:
                print 'The server did not return the expected json data'

        except:
            pass

class HazardListHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine

    def get(self):
        os.chdir(os.path.join(os.path.dirname(os.path.realpath(__file__)),'..'))
        path = os.path.join(os.getcwd(),'static/json/')
        to_return = []
        # muncities_url = BACKEND_URL + 'locations/muncities'
        # provinces_url = BACKEND_URL + 'locations/provinces'
        #
        # flood_hazards_url = BACKEND_URL + 'hazards'
        try:
            # flood_hazards_resp = yield gen.Task(AsyncHTTPClient().fetch, flood_hazards_url)
            # flood_hazards_json = json.loads(flood_hazards_resp.body)
            # muncities_resp = yield gen.Task(AsyncHTTPClient().fetch, muncities_url)
            # muncity_json = json.loads(muncities_resp.body)
            # provinces_resp = yield gen.Task(AsyncHTTPClient().fetch, provinces_url)
            # provinces_json = json.loads(provinces_resp.body)

            with open(path+'websafe_hazards.json') as json_data:
                flood_hazards_json = json.load(json_data)
            with open(path+'websafe_muncities.json') as json_data:
                muncity_json = json.load(json_data)
            with open(path+'websafe_provinces.json') as json_data:
                provinces_json = json.load(json_data)

            if flood_hazards_json['success'] == True and muncity_json['success'] == True:
                flood_hazards_data = flood_hazards_json['data']
                muncity_data = muncity_json['data']
                province_data = provinces_json['data']
                for json_data in flood_hazards_data:
                    temp = {}
                    temp['category'] = json_data['verbose_name']
                    temp['type_id'] = json_data['type_id']
                    temp['layer_array'] = []

                    for layer in json_data['layers']:
                        temp_flood_data = {}
                        #FIX THIS. For now every hazard layer is group as 'flood' since SSA and Flood are a single group.
                        #Landslide and multihazards should be grouped accordingly
                        temp_flood_data['haz_type'] = 'flood'
                        temp_flood_data['id'] = json_data['type_id']
                        temp_flood_data['psgc'] = layer['mun_city_psgc']
                        temp_flood_data['center'] = layer['center']
                        temp_flood_data['resource_name'] = layer['geoserver_layer']

                        for muncity in muncity_data:
                            if muncity['mun_city_psgc'] == temp_flood_data['psgc']:
                                temp_flood_data['verbose_name'] = muncity['verbose_name']
                                temp_flood_data['province_psgc'] = muncity['province_psgc']

                        for province in province_data:
                            if province['province_psgc'] == temp_flood_data['province_psgc']:
                                temp_flood_data['province_verbose_name'] = province['verbose_name']

                        temp['layer_array'].append(temp_flood_data)

                    temp['layer_array'] = sorted(temp['layer_array'], key=lambda k: k['verbose_name'])
                    to_return.append(temp)

                self.write(json.dumps(to_return))
            else:
                print 'The server did not return the expected json data'

        except:
            pass


class WebsafeHazardListHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self):
        # path = os.path.expanduser('~/noah-frontend-server/static/json/')
        os.chdir(os.path.join(os.path.dirname(os.path.realpath(__file__)), '..'))
        path = os.path.join(os.getcwd(), 'static/json/')
        to_return = []
        muncities_url = BACKEND_URL + 'locations/muncities'

        hazards_url = BACKEND_URL + 'hazards'
        try:
            # flood_hazards_resp = yield gen.Task(AsyncHTTPClient().fetch, hazards_url)
            # flood_hazards_json = json.loads(flood_hazards_resp.body)
            # muncities_resp = yield gen.Task(AsyncHTTPClient().fetch, muncities_url)
            # muncity_json = json.loads(muncities_resp.body)
            with open(path+'websafe_hazards.json') as json_data:
                flood_hazards_json = json.load(json_data)
            with open(path+'websafe_muncities.json') as json_data:
                muncity_json = json.load(json_data)
            with open(path+'websafe_provinces.json') as json_data:
                provinces_json = json.load(json_data)


            if flood_hazards_json['success'] == True and muncity_json['success'] == True:
                flood_hazards_data = flood_hazards_json['data']
                muncity_data = muncity_json['data']

                for json_data in flood_hazards_data:
                    temp = {}
                    temp['category'] = json_data['verbose_name']
                    temp['type_id'] = json_data['type_id']
                    temp['layer_array'] = []

                    for flood in json_data['layers']:
                        temp_flood_data = {}
                        temp_flood_data['haz_type'] = 'flood'
                        temp_flood_data['id'] = json_data['type_id']
                        temp_flood_data['psgc'] = flood['mun_city_psgc']
                        temp_flood_data['center'] = flood['center']
                        temp_flood_data['resource_name'] = flood['geoserver_layer']

                        for muncity in muncity_data:
                            if muncity['mun_city_psgc'] == temp_flood_data['psgc']:
                                temp_flood_data['verbose_name'] = muncity['verbose_name']
                        temp['layer_array'].append(temp_flood_data)

                    temp['layer_array'] = sorted(temp['layer_array'], key=lambda k: k['verbose_name'])
                    to_return.append(temp)

                self.write(json.dumps(to_return))
            else:
                print 'The server did not return the expected json data'

        except:
            pass


class CalculateHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self):
        calculate_url = BACKEND_URL + 'calculate'

        #print self.request.arguments
        psgc = self.get_argument('psgc')
        haz_type = self.get_argument('haz_type')
        haz_type_id = self.get_argument('haz_type_id')
        #exp_type = self.get_argument('exp')
        exp_type_id = self.get_argument('exp_type_id')

        params = {'psgc' : psgc,
                  'haz_type' : haz_type,
                  'haz_type_id' : haz_type_id,
                  'exp_type_id' : exp_type_id}

        body = urllib.urlencode(params)
        time.sleep(3)
        req = HTTPRequest(calculate_url, method='POST', body=body, request_timeout=20000)

        try:
            calculate_resp = yield gen.Task(AsyncHTTPClient().fetch, req)
            self.write(json.loads(calculate_resp.body))
        except:
            raise

class PDFHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self):
        body = self.get_argument('body')
        location = self.get_argument('location')
        url = ('static/websafe/' + time.strftime("%Y%m%d-%H%M%S") +
               '_' + location + '.pdf')
        HTML(string=str(body),
             base_url="file://%s/" % (ROOT)) \
            .write_pdf(url,
                stylesheets=[CSS('static/css/websafepdf.css'),
                             CSS(string='@page { size: A4; margin: 1cm }')])
        self.write(json.dumps({"success":True, "url":url}))

class WebsafeProfileHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self):

        try:
            psgc = self.get_argument('psgc')

            data_url = '{}websafe/profile?psgc={}'.format(BACKEND_URL,psgc)
            data_req = HTTPRequest(data_url,method='GET',request_timeout=20000)
            data_response = yield gen.Task(AsyncHTTPClient().fetch, data_req)
            result = json.loads(data_response.body)

            #if empty
            if not result:
                raise Exception

        except Exception as e:
            traceback.print_exc()
            result = {}

        finally:
            self.write(json.dumps(result))

class WebsafeDataHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self):

        to_return = {}
        table = self.get_argument('table')

        try:
            psgc = self.get_argument('mun_psgc')
            data_url = '%swebsafe/data?table=%s&mun_psgc=%s' % \
                (BACKEND_URL, table, psgc)
        except:
            data_url = '%swebsafe/data?table=%s' % (BACKEND_URL, table)

        metadata_url = '%swebsafe/metadata?table=%s' % (BACKEND_URL, table)


        data_req = HTTPRequest(data_url, method='GET', request_timeout=20000)
        metadata_req = HTTPRequest(metadata_url, method='GET', request_timeout=20000)
        try:
            data_resp = yield gen.Task(AsyncHTTPClient().fetch, data_req)
            metadata_resp = yield gen.Task(AsyncHTTPClient().fetch, metadata_req)
            data = json.loads(data_resp.body)
            metadata = json.loads(metadata_resp.body)

            if psgc and metadata['sucess']:
                for k, v in data.iteritems():
                    for json_data in metadata['data']:
                        if json_data['field'].lower() == k:
                            to_return[k] = {
                                'value': v,
                                'verbose_name': json_data['content']
                            }
            else:
                to_return = data

            self.write(json.dumps(to_return))
        except:
            self.write(json.dumps([]))

class WebsafeAdditionalDataHandler(JSONHandler):

    @web.asynchronous
    @gen.coroutine
    def get(self):

        try:
            psgc = self.get_argument('psgc')
            table = self.get_argument('table')

            data_url = '{}websafe/additionaldata?mun_psgc={}&table={}'.format(BACKEND_URL,psgc,table)
            data_req = HTTPRequest(data_url,method='GET',request_timeout=20000)
            data_response = yield gen.Task(AsyncHTTPClient().fetch, data_req)
            result = json.loads(data_response.body)

            #if empty
            if not result:
                raise Exception

        except Exception as e:
            traceback.print_exc()
            result = {}

        finally:
            self.write(json.dumps(result))