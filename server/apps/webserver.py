#!/usr/bin/env python                                                                                                                                                          
#                                                                                                                                                                              
# Copyright 2009 Facebook                                                                                                                                                      
#                                                                                                                                                                              
# Licensed under the Apache License, Version 2.0 (the "License"); you may                                                                                                      
# not use this file except in compliance with the License. You may obtain                                                                                                      
# a copy of the License at                                                                                                                                                     
#                                                                                                                                                                              
#     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                              
#                                                                                                                                                                              
# Unless required by applicable law or agreed to in writing, software                                                                                                          
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT                                                                                                    
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the                                                                                                     
# License for the specific language governing permissions and limitations                                                                                                      
# under the License.                                                                                                                                                            

import logging
import tornado.escape
import tornado.httpserver
import tornado.httpclient
import tornado.ioloop
import tornado.options
import tornado.web
import os.path
import uuid

from tornado.options import define, options
from verserain.base import uimodules

define("port", default=8888, help="run on the given port", type=int)

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
        ]

        from verserain.handlers import get_handlers

        handlers = get_handlers()

        app_settings = dict(
            ui_modules=uimodules,
            cookie_secret="43oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=",
            login_url="/login",
            template_path=os.path.join(os.path.dirname(__file__), "../templates"),
            static_path=os.path.join(os.path.dirname(__file__), "../static"),
            xsrf_cookies=False,
            debug=True,
            facebook_api_key="1439577092991935",
            facebook_secret="30934f472bc7108037ccc7e31f480366",
            site_url="http://verserain.eternityinourheart.com",
        )
        tornado.web.Application.__init__(self, handlers, **app_settings)

def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application(), xheaders=True)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()

