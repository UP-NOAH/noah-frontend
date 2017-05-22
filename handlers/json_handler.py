import json

from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
from config import SIDEBAR_DATA_URL, AUTH_URL

class BaseHandler(web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("NOAHSESSIONID")

    def get_error_msg(self, error_msg, error_code):
        return {'success': False, 'data': {'error_msg': error_msg, 'error_code': error_code}}


class JSONHandler(BaseHandler):
    def retrieve_data(self):
        with open(SIDEBAR_DATA_URL) as json_file:
            json_data = json.load(json_file)


        return json_data

    def retrieve_icons(self):
        data = self.retrieve_data()

        sidebar_data = []

        for component in data['components']:
            sidebar_data.append({
                "sidebar_name": component['component_name'],
                "sidebar_tag": component['component_tag'],
                "sidebar_img": component['component_img'],
                "sidebar_link": component['component_link']
            })

        return sidebar_data 

    def check_data(self, section, component):

        section_data = {}

        if section == 'all':
            section_data['title'] = component['component_name']
            section_data['sections'] = component['component_data']
            section_data['desc'] = component['component_desc']
        else:
            for sub_section in component['component_data']:
                if section == sub_section['section_tag']:
                    section_data['name'] = sub_section['section_name']
                    section_data['tag'] = sub_section['section_link']
                    section_data['data'] = sub_section['section_data']

        return section_data

    def check_locations(self, loc_type, location_data):

        new_location_data = []

        if loc_type == 'regions': 
            for location in location_data:
                new_location_data.append({
                    "name": location['verbose_name'],
                    "region": location['region_psgc']
                })

        elif loc_type == 'provinces':
            for location in location_data:
                new_location_data.append({
                    "name": location['verbose_name'],
                    "region": location['region_psgc'],
                    "province": location['province_psgc']
                })

        elif loc_type == 'muncities':
            for location in location_data:
                new_location_data.append({
                    "name": location['verbose_name'],
                    "region": location['region_psgc'],
                    "province": location['province_psgc'],
                    "municipal": location['mun_city_psgc']
                })

        return new_location_data
        
    def arrange_layer_data(self, layer_data):
        new_layer_data = []
        
        for event in layer_data:
            new_layer_data.append({
                "id": event["type_id"],
                "layers": event["layers"],
                "name": event["verbose_name"]
            })
            
        return new_layer_data