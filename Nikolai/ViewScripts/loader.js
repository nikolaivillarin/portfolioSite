/*------------------------------------*\
    Initialize Functionality
\*------------------------------------*/
function LoadImages() {
    var loader = window.imagesLoaded('body', { background: '[data-nv-bgimage]' });
    var loaded = false;

    loader.on('done', function () {
        loaded = true;
    });

    loader.on('fail', function () {
        loaded = true;
    });

    var $loadingTexts = $('[data-nv-loadingtext]');
    var loadingTextIndex = 0;

    var loadingIntervalID = window.setInterval(function () {
        if (loadingTextIndex < $loadingTexts.length - 2) {
            $loadingTexts.eq(loadingTextIndex).addClass('loading-text--out');

            window.setTimeout(function (curIndex) {
                $loadingTexts.eq(curIndex + 1).fadeIn(300);
            }, 800, loadingTextIndex);

            loadingTextIndex++;
        } else if (loadingTextIndex === $loadingTexts.length - 2 && loaded === true) {
            window.clearInterval(loadingIntervalID);

            $loadingTexts.eq(loadingTextIndex).addClass('loading-text--out');

            window.setTimeout(function (curIndex) {
                $loadingTexts.eq(curIndex + 1).fadeIn(300);

                window.setTimeout(function () {
                    window.MainNav.Initialize();
                }, 500);
            }, 800, loadingTextIndex);
        }
    }, 800);

    window.MainNav.UnsubscribeToOnPageLoaded(LoadImages);
}

(function LoadWebApp() {
    if (window.$ && window.MainNavigation) {
        $(document).ready(function () {
            window.MainNav = new window.MainNavigation();

            window.MainNav.SubscribeToOnPageLoaded(LoadImages);

            window.MainNav.EagerlyLoadPages();
        });
    } else {
        window.setTimeout(LoadWebApp, 50);
    }
})();