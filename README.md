# NOAH Frontend Server

This server will be accessed by the frontend using Ubuntu 12.04

### Install server dependencies

    $ sudo apt-get install libxml2-dev libxslt1-dev python-dev python-lxml python-setuptools git libffi-dev screen  python-pip python-dev build-essential python-cairosvg libcairo2-dev pango1.0
    $ sudo pip install cairosvg html5lib==1.0b8
    $ sudo easy_install tornado==3.2 paver screenutils weasyprint tinycss cssselect
    $ sudo easy_install 

### Server

To start the server:

    $ paver start

To stop the server:

    $ paver stop

To restart the server:

    $ paver restart



