var https = require('https'),
xml2js = require('xml2js'),
g = require('./guardian'),
argv = require('yargs').argv;

if(!argv.sitemap) {
    console.log('No sitemap configuration.');    
    return process.exit(1);
}
console.log('Guarding from ' + argv.sitemap + ' ...');
https.get(argv.sitemap, function(res) {
    console.log('Reading sitemap...');
    var response_data = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
        response_data += chunk;
    });
    res.on('error', function(err) {
        console.log('Got error: ' + err.message);
    });
    res.on('end', function() {
        var parser = new xml2js.Parser();
        parser.parseString(response_data, function(err, result) {
            if (err) {
                console.log('Got error: ' + err.message);
            } else {
                if(result && result.urlset && result.urlset.url) {
                    console.log('Got ' + result.urlset.url.length + ' links...');
                    var guardian = new g.Guardian(result.urlset.url, function(result) {
                        console.log(result);
                        if(result.successes.length === result.total)  {
                            console.log('All links are safe and sound :)');
                            process.exit(0);
                        }
                        else{
                            console.log('Some links have died ;(');
                            process.exit(1);
                        }
                    }).guardAllLinks();
                }
            }
        });
    });
});

