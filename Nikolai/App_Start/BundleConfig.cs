using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace Nikolai
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/Content/Styles").Include(
                "~/Content/Atoms/reset.css",
                "~/Content/Pages/Styles.css",
                "~/Content/Pages/Loading.css",
                "~/Content/Pages/Home.css",
                "~/Content/Pages/About.css",
                "~/Content/Pages/Contact.css",
                "~/Content/Pages/Work.css",
                "~/Content/Pages/Work-Multiplex.css",
                "~/Content/Pages/Work-Boxgrove.css",
                "~/Content/Pages/Work-RateQuote.css",
                "~/Content/Pages/Work-HR.css"
            ));

            bundles.Add(new ScriptBundle("~/Content/libraries").Include(
                "~/Scripts/jquery-{version}.js",
                "~/Scripts/jquery-ui-{version}.js",
                "~/Scripts/jquery.ui.touch-punch.js",
                "~/Scripts/imagesloaded.pkgd.js"
            ));

            bundles.Add(new ScriptBundle("~/Content/scripts").Include(
                "~/Scripts/clientErrorLogger.js"
                , "~/Scripts/navigationBar.js"
                , "~/Scripts/navigationTransition.js"
                , "~/Scripts/navigation.js"
                , "~/Scripts/floatingBall.js"
                , "~/ViewScripts/loader.js" 
            ));
        }
    }
}