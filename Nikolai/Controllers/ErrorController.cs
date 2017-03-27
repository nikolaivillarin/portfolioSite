using System;
using System.IO;
using System.Reflection;
using System.Text;
using System.Web.Mvc;

namespace Nikolai.Controllers
{
    public class ErrorController : Controller
    {
        [HandleError]
        public ActionResult Index(Exception exception)
        {
            // Report on missing assemblies - 10/27/2014 Nikolai
            var reflectionTypeLoadException = exception as ReflectionTypeLoadException;
            if (reflectionTypeLoadException != null)
            {
                var sb = new StringBuilder();
                foreach (Exception exSub in reflectionTypeLoadException.LoaderExceptions)
                {
                    sb.AppendLine(exSub.Message);
                    var exFileNotFound = exSub as FileNotFoundException;
                    if (exFileNotFound != null)
                    {
                        if (!string.IsNullOrEmpty(exFileNotFound.FusionLog))
                        {
                            sb.AppendLine("Fusion Log:");
                            sb.AppendLine(exFileNotFound.FusionLog);
                        }
                    }
                    sb.AppendLine();
                }
                string errorMessage = sb.ToString();
                Elmah.ErrorSignal.FromCurrentContext().Raise(new Exception(errorMessage));
            }

            Response.StatusCode = 500;
            Response.TrySkipIisCustomErrors = true;

            ViewBag.Error = exception.ToString();

            return View();
        }

        [HandleError]
        public ActionResult Http404()
        {
            Response.StatusCode = 404;
            Response.TrySkipIisCustomErrors = true;

            var exception = new Exception(string.Format("Page Not Found: {0}", Request.Url));
            Elmah.ErrorSignal.FromCurrentContext().Raise(exception);
            return View();
        }

        /// <summary>
        /// Logs JavaScript Errors without having an error page
        /// </summary>
        [HttpGet]
        public void JavascriptError(string errorMsg, string errorUrl, string linenumber)
        {
            if (!string.IsNullOrEmpty(errorMsg) || !string.IsNullOrEmpty(errorUrl)
                || !string.IsNullOrEmpty(linenumber))
            {
                var jsException = new Exception(
                    string.Format(
                        "JavaScript error has occured. Error Message: {0}. Script URL: {1}. Line Number: {2}"
                        , errorMsg, errorUrl, linenumber)
                    );

                Elmah.ErrorSignal.FromCurrentContext().Raise(jsException);
            }
        }
    }
}