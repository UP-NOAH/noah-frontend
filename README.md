# NOAH Frontend Server

This server was first installed and tested on Ubuntu 12.04. 

### Install server dependencies

    $ sudo apt-get install libxml2-dev libxslt1-dev python-dev python-lxml python-setuptools git libffi-dev screen  python-pip python-dev build-essential python-cairosvg libcairo2-dev pango1.0
    $ sudo pip install cairosvg html5lib==1.0b8
    $ sudo easy_install tornado==3.2 paver screenutils weasyprint tinycss cssselect

### Server

To start the server:

    $ cd noah-frontend server
    $ paver start

To stop the server:

    $ paver stop

To restart the server:

    $ paver restart

To access the server, go to http://localhost:8080

For a copy of config.py please contact info@noah.up.edu.ph
