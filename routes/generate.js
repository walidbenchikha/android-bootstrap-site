var wrench = require('wrench'),
    util = require('util'),
    spawn = require('child_process').spawn,
    fs = require('fs');
/*
 * Project generator route. 
*/
exports.index = function(req, res) {

    console.log(process.env.PWD);
    console.log(process.env.TMPDIR);

    
    // console.log(__dirname);
    // console.log(process.env);
    //quit(res);

    var appName = req.query.appName;
    var packageName = req.query.packageName;

    console.log("App Name:" + appName);
    console.log("Package Name:" + packageName);


    // 1. Create a temporary file location. 
    // 2. Rename the directories accordingly. 
    // 3. Loop over all the files and perform replacements. 
    // 4. Zip up the file & Send to the output stream
    // 5. Delete the temporary file. 
    // 6. All Done. 

    // Android Bootstrap ource directory
    var sourceDir = process.env.PWD + '/android-bootstrap';
    
    // Temporary locationwhere the users project will be generated.
    var destDir = process.env.TMPDIR + packageName + "/"; 

    console.log("sourceDir: " + sourceDir);
    console.log("destDir: " + destDir); 

    // Copy the files to temp directory. 
    wrench.copyDirSyncRecursive(sourceDir, destDir);

    
    res.send("Done");
    return;


    var files = []; 
    wrench.readdirRecursive(destDir, function(error, curFiles) {
      // Callback receives the files in the currently recursed directory. 
      // When no more dirs are left, callback is called with null for all arguments. 
      // SRC: https://github.com/ryanmcgrath/wrench-js/blob/master/lib/wrench.js

      if(error) {
        res.json(500, { err : error });
        throw err; 

      } else {

        if(curFiles) {
          
          curFiles.forEach(function(currentFile){
            // Generate the new file with proper namespace/etc
            generateFile(destDir + '/' + currentFile, packageName, appName); 
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

function generateFile(file, packageName, appName, callback) {

  var stats = fs.lstatSync(file);
  if(!stats.isDirectory()) { // Only work with files, not directories .  
    // Must include the encoding otherwise the raw buffer will
    // be returned as the data.
    fs.readFile(file, 'utf-8', function(err, data) {
        
        //console.log("Current File: " + file);
        if(!err) {
          console.log("File: " + file);
          // Sure, we could chain these, but this is easier to read.
          data = replacePackageName(data, packageName);
          data = replaceAuthToken(data, packageName);
          data = replaceAppName(data, packageName);

          // Finally all done doing replacing, save this bad mother.
          // TODO: Save the file in the new location. 
          renderFileContent(data, getBootstrappedFileName(file, packageName) );
          //callback(tempFolderName); 
        } else {
          console.error(err);
          throw err;
        }

    });
  }
}

/*
 * Accepts a file and then renders the contents of the file back out with the appropriate 
 */
function renderFileContent(content, path) {
  console.log(path);
  // TODO: use wrech to write the recursive file path, then render the file. 
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

// Turns a package name into a file path string. 
// Example: com.foo.bar.bang turns into com\foo\bar\bang
function getNewFilePath(newPackageName) {
  return newPackageName.split('.').join('/'); 
}

function getOldFilePath() {
  return "com.donnfelker.android.bootstrap".split('.').join('/'); 
}

// Takes the old boostrap file name and returns the new file name
// that is created via the transform from the new package name. 
function getBootstrappedFileName(bootstrapFileName, newPackageName) {
  return bootstrapFileName.replace( getOldFilePath(), getNewFilePath(newPackageName) );
}

function replacePackageName(fileContents, newPackageName) {
  var BOOTSTRAP_PACKAGE_NAME = "com.donnfelker.android.bootstrap"; // replace all needs a regex with the /g (global) modifier
  var packageNameRegExp = new RegExp(BOOTSTRAP_PACKAGE_NAME, 'g');
          
  // Replace package name
  return fileContents.replace(packageNameRegExp, newPackageName);
}

function replaceAuthToken(fileContents, newPackageName) {
  var BOOTSTRAP_TOKEN = "com.androidbootstrap";
  var tokenRegExp = new RegExp(BOOTSTRAP_TOKEN, 'g'); // global search

  return fileContents.replace( tokenRegExp, newPackageName );
}

function replaceAppName(fileContents, newAppName) {
  var APP_NAME = "Android Bootstrap";
  var nameRegExp = new RegExp(APP_NAME, 'g'); // global search

  return fileContents.replace(nameRegExp, newAppName);
}