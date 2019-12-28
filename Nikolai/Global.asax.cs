using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Optimization;
using Nikolai.Models;

namespace Nikolai
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            #if RELEASE
            var exception = Server.GetLastError();
            var httpException = exception as HttpException;
            Response.Clear();
            Server.ClearError();
            var routeData = new RouteData();
            routeData.Values["controller"] = "Error";
            routeData.Values["action"] = "Index";
            routeData.Values["exception"] = exception;
            Response.StatusCode = 500;

            if (httpException != null)
            {
                Response.StatusCode = httpException.GetHttpCode();

                switch (Response.StatusCode)
                {
                    case 404:
                        return; // Ignore 404 Errors
                }
            }

            IController errorsController = new Nikolai.Controllers.ErrorController();
            var rc = new RequestContext(new HttpContextWrapper(Context), routeData);
            errorsController.Execute(rc);
            #endif
        }
    }
}
