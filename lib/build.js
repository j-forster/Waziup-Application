var fs = require("fs"),
    glob = require("glob"),
    sass = require("node-sass");

console.log("Starting build process...");

compileSCSS();

///////////////////////////////////////////////////////////

function done() {
  
  console.log("OK");
}

//


function compileSCSS() {
  
  

  glob("www/**/*.scss", function (er, files) {

    var n = files.length;
    
    console.log("[SCSS] Processing "+n+" files");
    
    
    files.forEach(file => {

      var normalFile = file.substr(0, file.length-4),
          outFile = normalFile + "css",
          sourceMap = normalFile + "css.map";

      sass.render({ file, outFile, sourceMap }, (err, result) => {

        if(err) {

          console.error("[SCSS] Error: "+file);
          console.error(err)
        } else {

          if(result) {

            console.log("[SCSS] "+file+" > "+outFile);
            fs.writeFile(outFile, result.css);
            fs.writeFile(sourceMap, result.map);
          }
        }
        
        if(! --n) done();
      });
    })
  });
}

///////////////////////////////////////////////////////////


