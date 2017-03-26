function RateQuotePage() {
    /// <summary>
    /// Default Constructor
    /// </summary>

    this.Initialize();
}

RateQuotePage.prototype.Initialize = function () {
    window.MainNav.SubscribeToDialClick(
        $.proxy(this.CloseClick, this)
    );
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
$(function () {
    new RateQuotePage();
});