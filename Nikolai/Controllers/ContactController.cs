using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Nikolai.Models;
using System.Net;

namespace Nikolai.Controllers
{
    public class ContactController : Controller
    {
        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult ContactPartial()
        {
            return PartialView("_contact");
        }

        [HttpPost]
        public ActionResult Message(ContactFormModel model)
        {
            if (ModelState.IsValid)
            {
                var emailHelper = new EmailHelper("mail.nikolaivillarin.com", 587, "donotreply@nikolaivillarin.com", "donotreply@nikolaivillarin.com", "winhostsino1987!");
                emailHelper.AddEmailTo("hello@nikolaivillarin.com");

                emailHelper.Subject = "Contact Form: " + model.Name;
                emailHelper.CustomizedPlainEmailBody = string.Format("Name: {0}, Email: {1}, Message: {2}", model.Name, model.Email, model.Message);

                emailHelper.Send();

                return new HttpStatusCodeResult(HttpStatusCode.OK);
            }
            else
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
        }
    }
}