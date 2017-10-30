# bity.js

## To Build:

install 'nan' and 'bindings'
```text
$ npm install --save nan
$ npm install --save bindings
```

we'll also need to install 'ws' and 'express' to run the server
```text
$ npm install —save ws
$ npm install —save express
```

make sure the correction path and version number of Objectivity is definined in binding.gyp
build the objyaccess node project
```text
$ node-gyp rebuild
```


## To run the server
```text
$ node server
```

