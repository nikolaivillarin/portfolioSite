function AboutPage() {
    this.Initialize();
}

AboutPage.prototype = {
    ScrollAnimation: null
};

AboutPage.prototype.Initialize = function () {
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    var scrollOptions = {
        ScrollThresholdAdjustment: $('#pnlMainNav').innerHeight()
        , RevertWhenOutOfView: true
    };

    this.ScrollAnimation = new window.ScrollAnimation('about', scrollOptions);
};

AboutPage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'about') {
        this.ScrollAnimation.Enable();
    } else {
        this.ScrollAnimation.Disable();
    }
};

// Initializer
(function LoadAboutScript() {
    if (window.MainNav && window.MainNav.HasNavigationLoaded === true) {
        new AboutPage();
    } else if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new AboutPage();
        });
    } else {
        window.setTimeout(LoadAboutScript, 50);
    }
})();