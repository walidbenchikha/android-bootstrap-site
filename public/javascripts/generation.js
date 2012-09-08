$(function(){
  
  $("#generate-app").click(function() {
    
    var appName = $("#appName"); 
    var packageName = $("#packageName");

    if(appName && appName.val().length > 0 && packageName && packageName.val().length > 0 && packageNameIsDomain(packageName.val())) {
      $(location).attr('href', '/generate?appName=' + appName.val() + "&packageName=" + packageName.val());
    } else {
      alert("Please enter a valid package name and app name.");
    }

  });

});

function packageNameIsDomain(packageNameValue) {
  // Validate a domain name
  var domainRegEx = new RegExp("^[a-z0-9]+([\.]{1}[a-z0-9]+)?([\.]{1})[a-z0-9]+$"); 
  return domainRegEx.test(packageNameValue);
}