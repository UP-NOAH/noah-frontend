class BaseException(Exception):
    def __init__(self):
        self.error_msg = 'Unexpected error!'
        self.error_code = 1000

class AuthenticationError(BaseException):
    def __init__(self):
        self.error_msg = 'Unauthorized!'
        self.error_code = 1001

class BadRequestError(BaseException):
    def __init__(self):
        self.error_msg = 'URL not found!'
        self.error_code = 1002

class FileNotFoundError(BaseException):
    def __init__(self):
        self.error_msg = 'File not found!'
        self.error_code = 1003

class ForbiddenAccessError(BaseException):
    def __init__(self):
        self.error_msg = 'Forbidden / Access denied!'
        self.error_code = 1004

class HTTPRequestError(BaseException):
    def __init__(self):
        self.error_msg = 'Request timeout!'
        self.error_code = 1005




