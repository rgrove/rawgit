# RawGit

This is the source code behind <https://rawgit.com/>.


## Installing

1. Install Node.js or io.js.

2. Clone this git repo (fork it first if you plan to make changes).

        git clone git://github.com/rgrove/rawgit.git

3. Install dependencies.

        cd rawgit && npm install

4. Start the local server.

        npm start

5. Browse to <http://localhost:5000/> and you should see RawGit in action.


## Running Tests

```
npm test
```

## Checking your local installation

To check your installation, point a local web browser to a GitHub file you want
RawGit to serve, using the following URL format:

    http://localhost:5000/user/repo/branch/file

For example: <http://localhost:5000/rgrove/rawgit/master/web.js>


Contributing
------------

Want to add a feature or fix a bug? If it's something small, just send a pull
request. If it's something big, please get in touch and ask if I'm interested
before working on it.


License
-------

Copyright (c) 2016 Ryan Grove (ryan@wonko.com).

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
