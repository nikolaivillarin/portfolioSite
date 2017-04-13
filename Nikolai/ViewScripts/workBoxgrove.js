function BoxgrovePage() {
    /// <summary>
    /// Default Constructor
    /// </summary>

    this.Initialize();
}

BoxgrovePage.prototype = {
    ScrollAnimation: null
};

BoxgrovePage.prototype.Initialize = function () {
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    window.MainNav.SubscribeToDialClick(
        $.proxy(this.CloseClick, this)
    );

    this.ScrollAnimation = new window.ScrollAnimation('work-boxgrove', { EnableParallax: true });
};

BoxgrovePage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'work-boxgrove') {
        this.ScrollAnimation.Enable();
    } else {
        this.ScrollAnimation.Disable();
    }
};

BoxgrovePage.prototype.CloseClick = function (selectedPageId) {
    /// <summary>
    /// Event handler to return to work page
    /// </summary>
    if (selectedPageId === 'work-boxgrove') {
        window.MainNav.NavigateTo('/Work');
    }
};

// Initializer
(function LoadWorkBoxGroveScript() {
    if (window.MainNav && window.MainNav.HasNavigationLoaded === true) {
        new BoxgrovePage();
    } else if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new BoxgrovePage();
        });
    } else {
        window.setTimeout(LoadWorkBoxGroveScript, 50);
    }
})();