function HRPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>

    this.Initialize();
}

HRPage.prototype = {
    ScrollAnimation: null
};

HRPage.prototype.Initialize = function () {
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    window.MainNav.SubscribeToDialClick(
        $.proxy(this.CloseClick, this)
    );

    this.ScrollAnimation = new window.ScrollAnimation('work-hr', { EnableParallax: true });
};

HRPage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'work-hr') {
        this.ScrollAnimation.Enable();
    } else {
        this.ScrollAnimation.Disable();
    }
};

HRPage.prototype.CloseClick = function (selectedPageId) {
    /// <summary>
    /// Event handler to return to work page
    /// </summary>
    if (selectedPageId === 'work-hr') {
        window.MainNav.NavigateTo('/Work');
    }
};

// Initializer
(function LoadWorkHRScript() {
    if (window.MainNav && window.MainNav.HasNavigationLoaded === true) {
        new HRPage();
    } else if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new HRPage();
        });
    } else {
        window.setTimeout(LoadWorkHRScript, 50);
    }
})();