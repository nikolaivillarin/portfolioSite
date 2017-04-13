function RateQuotePage() {
    /// <summary>
    /// Default Constructor
    /// </summary>

    this.Initialize();
}

RateQuotePage.prototype = {
    ScrollAnimation: null
};

RateQuotePage.prototype.Initialize = function () {
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    window.MainNav.SubscribeToDialClick(
        $.proxy(this.CloseClick, this)
    );

    this.ScrollAnimation = new window.ScrollAnimation('work-ratequote', { EnableParallax: true });
};

RateQuotePage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'work-ratequote') {
        this.ScrollAnimation.Enable();
    } else {
        this.ScrollAnimation.Disable();
    }
};

RateQuotePage.prototype.CloseClick = function (selectedPageId) {
    /// <summary>
    /// Event handler to return to work page
    /// </summary>
    if (selectedPageId === 'work-ratequote') {
        window.MainNav.NavigateTo('/Work');
    }
};

// Initializer
(function LoadWorkRateQuoteScript() {
    if (window.MainNav && window.MainNav.HasNavigationLoaded === true) {
        new RateQuotePage();
    } else if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new RateQuotePage();
        });
    } else {
        window.setTimeout(LoadWorkRateQuoteScript, 50);
    }
})();