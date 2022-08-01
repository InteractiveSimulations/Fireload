#from http import cookies
#import requests

#url = 'http://192.168.178.20:8080/'

##Creates a RequestsCookieJar object.
#cookies_jar = requests.cookies.RequestsCookieJar()

##Add cookie
##the parameters are: cookie_key,  cookie_value, cookie_domain, cookie_path
#cookies_jar.set("FloorTexture", "smallTiles", domian='192.168.178.20:8080/', path='/cookies')

#get url with cooke parameter
#response = requests.get(url, cookies=cookies_jar)

from bottle import get, run, view, post, request, response
####################
@get("/")
def _():
    #get a value from client um test zu ersetzen
    response.set_cookie("user", "test")
####################




run(host="127.0.0.1", port= 3333, debug= True, reloader=True)
