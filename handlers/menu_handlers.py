import tornado.web
from json_handler import BaseHandler

class MenuTemplateHandler(tornado.web.RequestHandler):
	def get(self, url):

		if (url == 'menulevel1'):
			self.render("menu/menulevel1.html")
		else:
			self.render("menu/menulevel2.html")
            
class AboutPageHandler(BaseHandler):
    def get(self, url):
        if (url == 'about'):
            self.render("about.html", name=self.get_current_user() if self.get_current_user() != 'public' else None)
        elif (url == 'login'):
        	self.render("login.html")
