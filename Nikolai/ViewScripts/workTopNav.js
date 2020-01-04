function TopNavPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>

    this.Initialize();
}

TopNavPage.prototype = {
    ScrollAnimation: null
};

TopNavPage.prototype.Initialize = function () {
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    window.MainNav.SubscribeToDialClick(
        $.proxy(this.CloseClick, this)
    );

    this.ScrollAnimation = new window.ScrollAnimation('work-topnav', { EnableParallax: true });

    // Delay to ensure images load before Rellax positions them
    window.setTimeout(function () {
        var rellax = new Rellax('.jsTopNavRellax', {
            wrapper: '.jsTopNavRellaxContainer',
            center: true
        });
    }, 3000);
};

TopNavPage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'work-topnav') {
        this.ScrollAnimation.Enable();
    } else {
        this.ScrollAnimation.Disable();
    }
};

TopNavPage.prototype.CloseClick = function (selectedPageId) {
    /// <summary>
    /// Event handler to return to work page
    /// </summary>
    if (selectedPageId === 'work-topnav') {
        window.MainNav.NavigateTo('/Work');
    }
};

// Initializer
(function LoadWorkTopNavScript() {
    if (window.MainNav && window.MainNav.HasNavigationLoaded === true) {
        new TopNavPage();
    } else if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new TopNavPage();
        });
    } else {
        window.setTimeout(LoadWorkTopNavScript, 50);
    }
})();