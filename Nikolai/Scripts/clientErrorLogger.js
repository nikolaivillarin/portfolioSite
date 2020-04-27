/// <summary>
/// Logs JavaScript errors that occurs on the client
/// </summary>
window.onerror = function (msg, url, line, col, error) {
    // Note that col & error are new to the HTML 5 spec
    var extra = !col ? '' : ' column: ' + col;
    extra += !error ? '' : ' error: ' + error;

    // If statement to deal with user plugin errors.
    // Handle errors only coming from the domain, or
    // errors with no URL.
    // Also handle errors from Localhost for debugging purposes.
    if (url &&
        url.indexOf('nikolaivillarin.com') !== -1 &&
        url.indexOf('localhost') !== -1) {
        var errorData = {
            errorMsg: msg
            , errorUrl: url
            , linenumber: line + extra
        };

        $.get('/Error/JavaScriptError', errorData);
    }
};