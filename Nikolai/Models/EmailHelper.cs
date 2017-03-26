using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Configuration;

namespace Nikolai.Models
{
    /// <summary>
    /// Usage Guidelines
    /// Basic Usage:
    ///  1) Specify an Email To Address
    ///  2) Specify an Email Subject
    ///  3) Specify an Email body
    ///  4) Call Send() Method
    ///  
    ///  Templates Usage:
    ///  - Single fields should be wrapped like so: ##fieldNameToBeReplaced##
    ///  - Repeating fields should be wrapped like so: 
    /// {{repeatingFieldWrapper}}
    ///     ##fieldNameToBeReplaced##
    /// {{/repeatingFieldWrapper}}
    /// 
    /// For more information refer to MIS CheatSheets > Web Applications > API
    /// </summary>
    public class EmailHelper
    {
        #region Private Fields & Constants
        private string _smtpServer;
        private int _smtpPort;
        private string _emailFrom;
        private string _username;
        private string _password;

        private string _plainEmailBody;
        private string _htmlEmailBody;
        private MailAddressCollection _emailToList;
        private MailAddressCollection _emailBccList;
        private MailMessage _message;
        private EmailTemplateEngine _templateBuilder;
        #endregion

        #region Properties
        /// <summary>
        /// [Optional] Customized Plain Email Body
        /// This property is used when you plan to generate your own 
        /// email body. Otherwise, use the TemplateBuilder to build your
        /// email.
        /// </summary>
        public string CustomizedPlainEmailBody
        {
            get
            {
                if (_plainEmailBody == null)
                {
                    _plainEmailBody = string.Empty;
                }
                return _plainEmailBody;
            }
            set
            {
                _plainEmailBody = value;
            }
        }

        /// <summary>
        /// [Optional] Customized HTML Email body
        /// This property is used when you plan to generate your own 
        /// email body. Otherwise, use the TemplateBuilder to build your
        /// email.
        /// </summary>
        public string CustomizedHtmlEmailBody
        {
            get
            {
                if (_htmlEmailBody == null)
                {
                    _htmlEmailBody = string.Empty;
                }

                return _htmlEmailBody;
            }
            set
            {
                _htmlEmailBody = value;
            }
        }

        public MailAddressCollection EmailToList
        {
            get
            {
                if (_emailToList == null)
                {
                    _emailToList = new MailAddressCollection();
                }
                return _emailToList;
            }
            set
            {
                _emailToList = value;
            }
        }

        /// <summary>
        /// Email From Defaults to DoNotReply@lakesidebesmart.com
        /// if not specified
        /// </summary>
        public string EmailFrom { get; set; }

        public MailAddressCollection EmailBccList
        {
            get
            {
                if (_emailBccList == null)
                {
                    _emailBccList = new MailAddressCollection();
                }
                return _emailBccList;
            }
            set
            {
                _emailBccList = value;
            }
        }

        public string Subject { get; set; }

        public MailMessage Message
        {
            get
            {
                if (_message == null)
                {
                    _message = new MailMessage();
                }
                return _message;
            }
            protected set
            {
                _message = value;
            }
        }

        public EmailTemplateEngine TemplateBuilder
        {
            get
            {
                if (_templateBuilder == null)
                {
                    _templateBuilder = new EmailTemplateEngine();
                }

                return _templateBuilder;
            }
        }
        #endregion

        #region Constructors
        public EmailHelper(string smtpServer, int smtpPort, string emailFrom, string userName, string password)
        {
            _smtpServer = smtpServer;
            _smtpPort = smtpPort;
            _emailFrom = emailFrom;
            _username = userName;
            _password = password;
        }
        #endregion

        #region Methods
        public void Send()
        {
            // Reset State
            Message.From = GetEmailFrom();
            Message.Subject = Subject;
            Message.AlternateViews.Clear();
            Message.To.Clear();
            Message.Bcc.Clear();

            // Add Email to
            foreach (MailAddress address in EmailToList)
            {
                Message.To.Add(address);
            }

            // Add BCC to
            foreach (MailAddress address in EmailBccList)
            {
                Message.Bcc.Add(address);
            }

            // Generate Plain Email Body
            string plainEmailBody = string.Empty;

            if (string.IsNullOrEmpty(TemplateBuilder.PlainTemplate) == false)
            {
                plainEmailBody = TemplateBuilder.PlainTemplate;
            }
            else if (string.IsNullOrEmpty(CustomizedPlainEmailBody) == false)
            {
                plainEmailBody = CustomizedPlainEmailBody;
            }

            // Generate HTML Email Body
            string htmlEmailBody = string.Empty;

            if (string.IsNullOrEmpty(TemplateBuilder.HtmlTemplate) == false)
            {
                htmlEmailBody = WrapBrandingContainer(TemplateBuilder.HtmlTemplate);
            }
            else if (string.IsNullOrEmpty(CustomizedHtmlEmailBody) == false)
            {
                htmlEmailBody = WrapBrandingContainer(CustomizedHtmlEmailBody);
            }

            // Set Plain fall back email
            if (string.IsNullOrEmpty(plainEmailBody) == false)
            {
                var plainEmail = AlternateView.CreateAlternateViewFromString(plainEmailBody, null, "text/plain");
                Message.AlternateViews.Add(plainEmail);
            }

            // Set HTML Email
            if (string.IsNullOrEmpty(htmlEmailBody) == false)
            {
                var htmlEmail = AlternateView.CreateAlternateViewFromString(htmlEmailBody, null, "text/html");
                Message.AlternateViews.Add(htmlEmail);

                // Use Embedded resource for portability
                //var logoBitmap = new Bitmap(Properties.Resources.LakesideLogoForEmail);
                var converter = new ImageConverter();
                //byte[] logoBytes = (byte[])converter.ConvertTo(logoBitmap, typeof(byte[]));
                //var logoResource = new LinkedResource(new MemoryStream(logoBytes), "image/jpeg");

                //logoResource.ContentId = "lakesideLogo";
                //logoResource.TransferEncoding = System.Net.Mime.TransferEncoding.Base64;
                //htmlEmail.LinkedResources.Add(logoResource);
            }

            if (string.IsNullOrEmpty(plainEmailBody) && string.IsNullOrEmpty(htmlEmailBody))
            {
                throw new InvalidOperationException("An email body has not been specified.");
            }
            else
            {
                SendEmail();
            }
        }

        public void SetEmailFrom(string emailFrom)
        {
            EmailFrom = emailFrom;
        }

        public void SetEmailSubject(string subject)
        {
            Subject = subject;
        }

        /// <summary>
        /// Adds the given attachments to the email
        /// </summary>
        /// <param name="attachmentPaths">Relative path to the attachment</param>
        public void AddAttachments(IEnumerable<string> absoluteAttachmentPaths)
        {
            foreach (var attachmentPath in absoluteAttachmentPaths)
            {
                AddAttachment(attachmentPath);
            }
        }

        /// <summary>
        /// Adds an attachment to the email
        /// </summary>
        /// <param name="attachmentPath">Relative path to the attachment</param>
        public void AddAttachment(string absoluteAttachmentPath)
        {
            if (string.IsNullOrEmpty(absoluteAttachmentPath))
            {
                throw new ArgumentNullException("A relative attachment path must be specified");
            }

            var absolutePathValidation = @"^\w+:\\";

            if (Regex.IsMatch(absoluteAttachmentPath, absolutePathValidation) == false)
            {
                throw new InvalidOperationException("Path specified must be fully qualified");
            }

            Message.Attachments.Add(new Attachment(absoluteAttachmentPath));
        }

        public void RemoveAttachments()
        {
            Message.Attachments.Clear();
        }

        public void AddEmailTo(string emailAddress)
        {
            EmailToList.Add(new MailAddress(emailAddress));
        }

        public void AddEmailBCC(string emailAddress)
        {
            EmailBccList.Add(new MailAddress(emailAddress));
        }

        /// <summary>
        /// Replaces the current email to list with the specified email address
        /// </summary>
        /// <param name="emailAddress"></param>
        public void ChangeEmailTo(string emailAddress)
        {
            EmailToList.Clear();
            AddEmailTo(emailAddress);
        }

        /// <summary>
        /// Replaces the currrent BCC email to the email specified
        /// </summary>
        /// <param name="emailAddress"></param>
        public void ChangeBCCTo(string emailAddress)
        {
            EmailBccList.Clear();
            AddEmailBCC(emailAddress);
        }

        public void RevertEmailFromToDefault()
        {
            EmailFrom = string.Empty;
        }

        /// <summary>
        /// Builds the plain mail body by replacing the fields with the values specified.
        /// A convention is being used here, all keys in the template must be wrapped in ##
        /// (Example: ##thisValueWillBeReplaced##)
        /// </summary>
        /// <param name="fields">Key to search for (EG: thisValueWillBeReplaced). Value to replace</param>
        /// <param name="template">Email template</param>
        public void BuildPlainMailBody(EmailFields fields, string template)
        {
            CustomizedPlainEmailBody = BuildMailBody(fields, template);
        }

        /// <summary>
        /// Builds the HTML mail body by replacing the fields with the values specified.
        /// A convention is being used here, all keys in the template must be wrapped in ##
        /// (Example: ##thisValueWillBeReplaced##)
        /// </summary>
        /// <param name="fields">Key to search for (EG: thisValueWillBeReplaced). Value to replace</param>
        /// <param name="template">Email template</param>
        public void BuildHTMLMailBody(EmailFields fields, string template)
        {
            CustomizedHtmlEmailBody = BuildMailBody(fields, template);
        }

        protected string BuildMailBody(EmailFields fields, string template)
        {
            var mailbody = string.Empty;
            var validationPattern = @"##\w+##";

            if (Regex.IsMatch(template, validationPattern) == false)
            {
                throw new InvalidOperationException("The given template is invalid. The template does not contain any fields to be replaced");
            }

            mailbody = template;

            if (fields.Fields.Count == 0 && fields.RepeatingFields.Count() == 0)
            {
                throw new NullReferenceException("No fields has been specified to be replaced");
            }

            // Repeating Email Fields
            foreach (var repeatingField in fields.RepeatingFields)
            {
                var rows = new List<string>();
                var regex = new Regex("{{" + repeatingField.ContainerID + @"}}(?<value>[\w\W\s]+){{/" + repeatingField.ContainerID + "}}");
                Match match = regex.Match(mailbody);
                string repeatingFieldTemplate = match.Groups["value"].ToString();

                // Look through each repeating row
                foreach (Dictionary<string, string> row in repeatingField.Rows)
                {
                    MatchCollection valueKeysForRow = Regex.Matches(repeatingFieldTemplate, @"##(?<value>\w+)##");
                    var rowTemplate = repeatingFieldTemplate;

                    // For each row populate values, if value is not found replace with empty string
                    foreach (Match key in valueKeysForRow)
                    {
                        string fieldName = key.Groups["value"].ToString();
                        string value = string.Empty;

                        row.TryGetValue(fieldName, out value);

                        rowTemplate = rowTemplate.Replace("##" + fieldName + "##", value);
                    }

                    rows.Add(rowTemplate);
                }

                mailbody = regex.Replace(mailbody, string.Join(" ", rows.ToArray()));
            }

            // Regular Email Fields
            foreach (var field in fields.Fields)
            {
                mailbody = mailbody.Replace(string.Format("##{0}##", field.Key), field.Value);
            }

            return mailbody;
        }

        /// <summary>
        /// Combines the specified Email Template with the Lakeside Branding container
        /// </summary>
        /// <returns></returns>
        protected virtual string WrapBrandingContainer(string contentTemplate)
        {
            //string fullHtmlTemplate = Properties.Resources.LakesideEmailBranding;
            string fullHtmlTemplate = string.Empty;
            fullHtmlTemplate = fullHtmlTemplate.Replace("##content##", contentTemplate);

            return fullHtmlTemplate;
        }

        protected MailAddress GetEmailFrom()
        {
            MailAddress emailFrom;

            if (string.IsNullOrEmpty(EmailFrom))
            {
                emailFrom = new MailAddress(_emailFrom);
            }
            else
            {
                emailFrom = new MailAddress(EmailFrom);
            }

            return emailFrom;
        }

        protected virtual void SendEmail()
        {
            var server = new SmtpClient(_smtpServer);
            server.UseDefaultCredentials = false;
            server.Credentials = new NetworkCredential(_username, _password);
            server.Port = _smtpPort;
            server.Send(Message);
        }
        #endregion

        #region Structs/Enums/Internal Classes
        /// <summary>
        /// Represents the email fields in an email template.
        /// </summary>
        public class EmailFields
        {
            #region Private Fields & Constants
            private Dictionary<string, string> _fields;
            private IEnumerable<RepeatingEmailField> _repeatingFields;
            #endregion

            #region Properties
            /// <summary>
            /// Key to search for (EG: thisValueWillBeReplaced). Value to replace
            /// </summary>
            public Dictionary<string, string> Fields
            {
                get
                {
                    if (_fields == null)
                    {
                        _fields = new Dictionary<string, string>();
                    }
                    return _fields;
                }
                set
                {
                    _fields = value;
                }
            }

            public IEnumerable<RepeatingEmailField> RepeatingFields
            {
                get
                {
                    if (_repeatingFields == null)
                    {
                        _repeatingFields = new List<RepeatingEmailField>();
                    }
                    return _repeatingFields;
                }
                set
                {
                    _repeatingFields = value;
                }
            }
            #endregion

            #region Methods
            /// <summary>
            /// Adds an item to the fields property
            /// </summary>
            /// <param name="fieldName"></param>
            /// <param name="fieldValue"></param>
            public void Add(string fieldName, string fieldValue)
            {
                Fields.Add(fieldName, fieldValue);
            }

            /// <summary>
            /// Adds a repeating item
            /// </summary>
            /// <param name="containerID">The id of the repeating container. EG: repeatingContainer in {{repeatingContainer}}</param>
            /// <param name="rowData">
            /// A collection of row data. The key represents the identifier for the field and the value is the value to replace
            /// </param>
            public void AddRepeatingItem(string containerID, Dictionary<string, string> rowData)
            {
                if (string.IsNullOrEmpty(containerID))
                {
                    throw new ArgumentNullException("containerID");
                }

                if (rowData == null)
                {
                    throw new ArgumentNullException("rowData");
                }

                var currentItems = (List<RepeatingEmailField>)RepeatingFields;
                RepeatingEmailField selectedContainer
                    = currentItems.Where(x => x.ContainerID == containerID).FirstOrDefault();

                if (selectedContainer != null)
                {
                    selectedContainer.AddRow(rowData);
                }
                else
                {
                    var newRepeatingItem = new RepeatingEmailField()
                    {
                        ContainerID = containerID
                    };

                    newRepeatingItem.AddRow(rowData);

                    currentItems.Add(newRepeatingItem);
                }

                RepeatingFields = currentItems;
            }
            #endregion
        }

        public class RepeatingEmailField
        {
            #region Properties
            /// <summary>
            /// Repeating sections wrapper name. EG: Customers in {{Customers}}
            /// </summary>
            public string ContainerID { get; set; }

            public IEnumerable<Dictionary<string, string>> Rows { get; set; }
            #endregion

            #region Methods
            public void AddRow(Dictionary<string, string> row)
            {
                List<Dictionary<string, string>> currentRows;

                if (Rows != null)
                {
                    currentRows = (List<Dictionary<string, string>>)Rows;
                }
                else
                {
                    currentRows = new List<Dictionary<string, string>>();
                }

                currentRows.Add(row);

                Rows = currentRows;
            }
            #endregion
        }
        #endregion
    }
}