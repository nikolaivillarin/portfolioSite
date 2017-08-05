using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Nikolai.Controllers
{
    public class BaseController : Controller
    {
        #region Overrides
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            #if RELEASE
            if (Request.UserAgent.ToLower().Contains("bing") == false)
            {
                var exception = new Exception(string.Format("Nibble on ", Request.UrlReferrer));

                Elmah.ErrorSignal.FromCurrentContext().Raise(exception);
            }
            #endif

            base.OnActionExecuting(filterContext);
        }
        #endregion
    }
}