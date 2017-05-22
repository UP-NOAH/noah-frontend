from handlers.json_handler import BaseHandler

class DocListHandler(BaseHandler):
	"""This lists the documentation files of the WebSafe Module"""

	def get(self):
		backend_docs = ['calculation_handler-py', 'categorical_hazard_population-py',
				'hazard_handler-py', 'populate_hazard_maps-py', 'populate_websafe_metadata',
				'populate_websafe-py', 'safe_tasks-py', 'websafe_data-py', 
				'websafe_queries-py']
		frontend_docs = ['websafe-py', 'WebsafeModule-js']
		self.render("docs_list.html", backend = backend_docs,
				frontend= frontend_docs)


class WebsafeDocHandler(BaseHandler):
	"""This retrieves the specified documentation file"""

	def get(self, **args):
		document = args['document']
		self.render("websafedocs/" + document + ".html")