function HRPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>

    this.Initialize();
}

HRPage.prototype.Initialize = function () {
    window.MainNav.SubscribeToDialClick(
        $.proxy(this.CloseClick, this)
    );
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
    if (window.MainNav) {
        new HRPage();
    } else {
        window.setTimeout(LoadWorkHRScript, 50);
    }
})();