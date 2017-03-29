function MultiplexPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>

    this.Initialize();
}

MultiplexPage.prototype.Initialize = function () {
    window.MainNav.SubscribeToDialClick(
        $.proxy(this.CloseClick, this)
    );
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