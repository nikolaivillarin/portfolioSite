function MultiplexPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>

    this.Initialize();
}

MultiplexPage.prototype = {
    ScrollAnimation: null
};

MultiplexPage.prototype.Initialize = function () {
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    window.MainNav.SubscribeToDialClick(
        $.proxy(this.CloseClick, this)
    );

    this.ScrollAnimation = new window.ScrollAnimation('work-multiplex', { EnableParallax: true });
};

MultiplexPage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'work-multiplex') {
        this.ScrollAnimation.Enable();
    } else {
        this.ScrollAnimation.Disable();
    }
};

MultiplexPage.prototype.CloseClick = function (selectedPageId) {
    /// <summary>
    /// Event handler to return to work page
    /// </summary>
    if (selectedPageId === 'work-multiplex') {
        window.MainNav.NavigateTo('/Work');
    }
};

// Initializer
(function LoadWorkMultiplexScript() {
    if (window.MainNav && window.MainNav.HasNavigationLoaded === true) {
        new MultiplexPage();
    } else if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new MultiplexPage();
        });
    } else {
        window.setTimeout(LoadWorkMultiplexScript, 50);
    }
})();