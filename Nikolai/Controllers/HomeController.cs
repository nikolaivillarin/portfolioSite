using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Nikolai.Models;

namespace Nikolai.Controllers
{
    public class HomeController : Controller
    {
        [HttpGet]
        public ActionResult Index()
        {
            //var emailHelper = new EmailHelper("mail.nikolaivillarin.com", 587, "donotreply@nikolaivillarin.com", "donotreply@nikolaivillarin.com", "winhostsino1987!");
            //emailHelper.AddEmailTo("nikolai@lakesidebesmart.com");
            
            //emailHelper.Subject = "test email";
            //emailHelper.CustomizedPlainEmailBody = "Test email";

            //emailHelper.Send();

            //throw new Exception("Test Error Handler 2");

            return View();
        }

        [HttpGet]
        public ActionResult HomePartial()
        {
            return PartialView("_home");
        }
    }
}