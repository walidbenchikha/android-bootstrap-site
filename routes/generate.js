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
    var destDir = process.env.TMPDIR + packageName; 

    console.log("sourceDir: " + sourceDir);
    console.log("destDir: " + destDir); 

    // Copy the files to temp directory. 
    wrench.copyDirSyncRecursive(sourceDir, destDir);

    //createSourceDirectories(destDir, packageName);

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
            generateFile(destDir + "/" + currentFile, packageName, appName);  // Generate the new file with proper namespace/etc
          });

        } else {
          // Both curFiles and error will be null when the file processing is complete. 
          
          // NOTE: Might need to add a settimeout to this badboy to execute in the future because some 
          // call backs might not be done executing yet. 
          createSourceDirectories(destDir, packageName);
          copySourceDirectories(sourceDir, destDir, packageName); 
          removeBootstrapDirectories(destDir); 
          
          //wrench.rmdirSyncRecursive(destDir, false);

          res.json(200, { message: "done"});

        }

        //res.json(200, { message: "done"});  
        // TODO: When done, zip the file and send it to the user. 
        // TODO: Move it to S3?
        // TODO: Then delete that file. 

      }
      
    });

    
}

function removeBootstrapDirectories(destDir) {

  // TODO: remove the old bootstrap source, unit-test and integration-test folders that are not valid anymore.
  console.log("Removing temporary work directories.");
  
  // Clean up - delete all the files we were just working with. 
  var bootstrapSourceDir = destDir + "/app/src/main/java/com/donnfelker"; 
  var bootstrapUnitTestDir = destDir + "/app/src/test/java/com/donnfelker"; 
  var integrationTestDir = destDir +  "/integration-tests/src/main/java/com/donnfelker"; 

  console.log("Removing: " + bootstrapSourceDir);
  console.log("Removing: " + bootstrapUnitTestDir);
  console.log("Removing: " + integrationTestDir);
  
  wrench.rmdirSyncRecursive(bootstrapSourceDir, false);
  wrench.rmdirSyncRecursive(bootstrapUnitTestDir, false);
  wrench.rmdirSyncRecursive(integrationTestDir, false);

}

// Creates the various new folder structures needed for the users new project. 
function createSourceDirectories(destDir, packageName) {

  var newPathChunk = getNewFilePath(packageName);

  var newSourceDirectory = destDir + "/app/src/main/java/" + newPathChunk; 
  console.log("Creating new source directory at: " + newSourceDirectory);
  wrench.mkdirSyncRecursive(newSourceDirectory); 

  var newUnitTestDirectory = destDir + "/app/src/test/java/" + newPathChunk; 
  console.log("Creating new source directory at: " + newUnitTestDirectory);
  wrench.mkdirSyncRecursive(newUnitTestDirectory); 

  var newIntegrationTestDirectory = destDir + "/integration-tests/src/main/java/" + newPathChunk; 
  console.log("Creating new integration tests directory at: " + newIntegrationTestDirectory);
  wrench.mkdirSyncRecursive(newIntegrationTestDirectory);     
}

function copySourceDirectories(sourceDir, destDir, packageName) {

  console.log(sourceDir);
  console.log(destDir);
  console.log(packageName);
  
  var newPathChunk = getNewFilePath(packageName);

  var oldSourceDir = sourceDir  +  "/app/src/main/java/com/donnfelker/android/bootstrap";  
  var newSourceDir = destDir    +  "/app/src/main/java/" + newPathChunk; 
  console.log("Creating new source directory at: " + newSourceDir);
  wrench.copyDirSyncRecursive(oldSourceDir, newSourceDir); 

  var oldUnitTestDir = sourceDir + "/app/src/test/java/com/donnfelker/android/bootstrap";
  var newUnitTestDir = destDir + "/app/src/test/java/" + newPathChunk; 
  console.log("Creating new source directory at: " + newUnitTestDir);
  wrench.copyDirSyncRecursive(oldUnitTestDir, newUnitTestDir); 

  var oldIntegrationTestDir = sourceDir + "/integration-tests/src/main/java/com/donnfelker/android/bootstrap";
  var newIntegrationTestDir = destDir + "/integration-tests/src/main/java/" + newPathChunk; 
  console.log("Creating new integration tests directory at: " + newIntegrationTestDir);
  wrench.copyDirSyncRecursive(oldIntegrationTestDir, newIntegrationTestDir);     
}

function generateFile(file, packageName, appName) {

  var stats = fs.lstatSync(file);
  if(!stats.isDirectory()) { // Only work with files, not directories .  
    
    // Must include the encoding otherwise the raw buffer will
    // be returned as the data.
    var data = fs.readFileSync(file, 'utf-8');
        
    //console.log("Current File: " + file);
  
    console.log("File: " + file);
    // Sure, we could chain these, but this is easier to read.
    data = replacePackageName(data, packageName);
    data = replaceAuthToken(data, packageName);
    data = replaceAppName(data, packageName);

    // Finally all done doing replacing, save this bad mother.
    // TODO: Save the file in the new location. 
    fs.writeFileSync(file, data); 
    
  }
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