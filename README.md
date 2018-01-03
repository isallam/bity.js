# bity.js

## Pre-req
This configuration use nodejs and npm, so make sure have have them installed.
```text
# on Ubuntu...
$ sudo apt install nodejs
$ sudo apt install npm
$ sudo npm install -g node-gyp
```

## To Build:

install 'nan' and 'bindings'
```text
$ npm install --save nan
$ npm install --save bindings
```

we'll also need to install 'ws' and 'express' to run the server
```text
$ npm install --save ws
$ npm install --save express
```

make sure the correction path and version number of Objectivity is definined in binding.gyp
build the objyaccess nodejs project
```text
$ node-gyp rebuild
```


## To run the server
### make sure to soruce the objy installation setup.sh for the library path availability
```text
$ nodejs server
```

