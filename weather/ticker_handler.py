import json, urllib2
from tornado import web, gen
from tornado.httpclient import AsyncHTTPClient
from config import TICKER_URL

class TickerHandler(web.RequestHandler):
    @web.asynchronous
    @gen.coroutine
    def get(self):
        try:
            newslink = urllib2.urlopen(TICKER_URL)
            news = newslink.read()
            news_date = news[6:23]
            news = news[24:-4].split(' || ')
            response = {
                'date' : '{date}'.format(date=news_date),
                'news' : ['{update}'.format(update=n) for n in news]
            }
            newslink.close()

        except:
            e = BaseException()
            response = {
                'error' : self.get_error_msg(e.error_msg, e.error_code)
            }

        finally:
            self.write(json.dumps(response))