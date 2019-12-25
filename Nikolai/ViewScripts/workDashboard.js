function DashboardPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>

    this.Initialize();
}

DashboardPage.prototype = {
    ScrollAnimation: null
};

DashboardPage.prototype.Initialize = function () {
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    window.MainNav.SubscribeToDialClick(
        $.proxy(this.CloseClick, this)
    );

    this.ScrollAnimation = new window.ScrollAnimation('work-dashboard', { EnableParallax: true });
};

DashboardPage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'work-dashboard') {
        this.ScrollAnimation.Enable();
    } else {
        this.ScrollAnimation.Disable();
    }
};

DashboardPage.prototype.CloseClick = function (selectedPageId) {
    /// <summary>
    /// Event handler to return to work page
    /// </summary>
    if (selectedPageId === 'work-dashboard') {
        window.MainNav.NavigateTo('/Work');
    }
};

// Initializer
(function LoadWorkDashboardScript() {
    if (window.MainNav && window.MainNav.HasNavigationLoaded === true) {
        new DashboardPage();
    } else if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new DashboardPage();
        });
    } else {
        window.setTimeout(LoadWorkDashboardScript, 50);
    }
})();