var wrench = require('wrench'),
    util = require('util'),
    spawn = require('child_process').spawn;
/*
 * Project generator route. 
*/
exports.index = function(req, res) {

    // TODO: The below variables do not work yet. Not sure why. Need to investigate. 
    var appName = req.params.appName;
    var packageName = req.params.packageName;

    console.log("App Name:" + appName);
    console.log("Package Name:" + packageName);


    // Steps
    // 1. Create a temporary file location. 
    // 2. Rename the directories accordingly. 
    // 3. Loop over all the files and perform replacements. 
    // 4. Zip up the file & Send to the output stream
    // 5. Delete the temporary file. 
    // 6. All Done. 

    var destDir = process.env.PWD + '/../android-bootstrap-2';

    // Copy the files. 
    // TODO: Uncopy once the files are in the system.
    //wrench.copyDirSyncRecursive(process.env.PWD + '/../android-bootstrap', destDir);



    var files = []; 
    wrench.readdirRecursive(destDir, function(error, curFiles) {
      // Callback receives the files in the currently recursed directory. 
      // When no more dirs are left, callback is called with null for all arguments. 
      // SRC: https://github.com/ryanmcgrath/wrench-js/blob/master/lib/wrench.js

      if(error) {
        res.json(500, { err : error });

      } else {

        if(curFiles) {
          
          curFiles.forEach(function(currentFile){
            // Process and rename files
            console.log(currentFile);
          });

        } else {
          // Both curFiles and error will be null when the fiel processing is complete. 
          res.json(200, { message: "done"});            
        }

        //res.json(200, { message: "done"});  
        // TODO: When done, zip the file and send it to the user. 
        // TODO: Move it to S3?
        // TODO: Then delete that file. 

      }
      
    });

    
}

/*
 * Accepts a file and then renders the contents of the file back out with the appropriate 
 */
function renderFileContent(pathToFile) {

}

/*
 * Sends a directory to the steam as a zip file. 
 * Source: http://stackoverflow.com/a/6837589/5210
 */
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