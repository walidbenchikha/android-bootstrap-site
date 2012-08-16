var wrench = require('wrench'),
    util = require('util'),
    spawn = require('child_process').spawn;
/*
 * Project generator route. 
*/
exports.index = function(req, res) {
  
    var destDir = process.env.PWD + '/../android-bootstrap-2';

    // Copy the files. 
    wrench.copyDirSyncRecursive(process.env.PWD + '/../android-bootstrap', destDir);

    sendZipToResponse(res, destDir);
    console.log(process.env);

}

function sendZipToResponse(res, dirToZip) {

  // Options -r recursive - redirect to stdout
  var zip = spawn('zip', ['-rD', '-', dirToZip]);

  res.contentType('zip');

  // Keep writing stdout to res
  zip.stdout.on('data', function (data) {
      res.write(data);
  });

  zip.stderr.on('data', function (data) {
      // Uncomment to see the files being added
      console.log('zip stderr: ' + data);
  });

  // End the response on zip exit
  zip.on('exit', function (code) {
      if(code !== 0) {
          res.statusCode = 500;
          console.log('zip process exited with code ' + code);
          res.end();
      } else {
          res.end();
      }
  });

}