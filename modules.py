import tornado.web

class NavbarModule(tornado.web.UIModule):
    def render(self, name):
        return self.render_string('modules/_navbar.html', name=name)