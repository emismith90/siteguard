var https = require('https');

exports.Guardian = function(links, doneCb, fnCheckLink)
{
    var cursorIndex = 0;

    var results = {
        successes: [],
        fails: [],
        total: links.length
    };

    var guard = fnCheckLink || function(url, cb){
        var link = url.loc[0];
        https.get(link, (res) => {
            cb({ 
                success: true,
                code: res.statusCode,
                msg: link
            });
        }).on('error', (e) => {
            cb({
                success: false,
                msg:  link
            });
        });
    };

    function moveNext() {
        if(cursorIndex == links.length) {
            results.successCount = results.successes.length;
            results.failCount = results.fails.length;

            doneCb(results);
            return;
        }
        var link = links[cursorIndex++];
        guard(link, jobDone);
    };

    function jobDone(payload) {
        if(payload.success){
            results.successes.push(payload.msg);
            console.log(payload.code + ' ' + payload.msg)
        }
        else {
            results.fails.push(payload.msg);
            console.log('ERROR ' + payload.msg)
        }

        moveNext();
    };

    return {
        guardAllLinks: function(){
            moveNext();
        }
    };
}
