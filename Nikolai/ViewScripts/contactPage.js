function ContactPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>
    this.Initialize();
}

ContactPage.prototype = {
};

ContactPage.prototype.Initialize = function () {
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );
};

ContactPage.prototype.OnPageChange = function () {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>

};

// Initializer
$(function () {
    new ContactPage();
});