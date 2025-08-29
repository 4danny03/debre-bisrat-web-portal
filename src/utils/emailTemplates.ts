/**
 * Email templates for various notifications
 */

// Common styling for all emails
const baseStyles = `
  font-family: 'Arial', sans-serif;
  color: #333333;
  line-height: 1.5;
`;

const buttonStyles = `
  display: inline-block;
  background-color: #8B0000;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 15px;
  margin-bottom: 15px;
  font-weight: bold;
`;

const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
`;

const headerStyles = `
  background-color: #8B0000;
  color: white;
  padding: 15px;
  text-align: center;
  border-radius: 5px 5px 0 0;
  margin-bottom: 20px;
`;

const footerStyles = `
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #666;
  text-align: center;
`;

export const templates = {
  // User registration templates
  userRegistration: {
    user: (data: { name?: string }) => `
      <div style="${baseStyles}${containerStyles}">
        <div style="${headerStyles}">
          <h1>Welcome to St. Gabriel Church</h1>
        </div>
        <p>Dear ${data.name || "Member"},</p>
        <p>Thank you for registering with St. Gabriel Ethiopian Orthodox Tewahedo Church. We're delighted to welcome you to our community.</p>
        <p>Your registration has been received, and we'll guide you through the next steps of the membership process.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Blessings,<br>St. Gabriel Church Team</p>
        <div style="${footerStyles}">
          <p>St. Gabriel Ethiopian Orthodox Tewahedo Church<br>Silver Spring, MD</p>
        </div>
      </div>
    `,
    admin: (data: {
      name?: string;
      email: string;
      phone?: string;
      membershipType?: string;
      memberId?: string;
    }) => `
      <div style="${baseStyles}${containerStyles}">
        <div style="${headerStyles}">
          <h1>New Member Registration</h1>
        </div>
        <p>A new member has registered with the church:</p>
        <ul>
          <li><strong>Name:</strong> ${data.name || "Not provided"}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Phone:</strong> ${data.phone || "Not provided"}</li>
          <li><strong>Membership Type:</strong> ${data.membershipType || "Not specified"}</li>
          <li><strong>Member ID:</strong> ${data.memberId || "Not assigned"}</li>
        </ul>
        <p>Please review this information and follow up with the member as needed.</p>
        <div style="${footerStyles}">
          <p>This is an automated notification from the St. Gabriel Church system.</p>
        </div>
      </div>
    `,
  },

  // Membership payment templates
  membershipPayment: {
    pending: (data: {
      name?: string;
      membershipType?: string;
      amount?: string;
      checkoutUrl?: string;
    }) => `
      <div style="${baseStyles}${containerStyles}">
        <div style="${headerStyles}">
          <h1>Complete Your Membership Payment</h1>
        </div>
        <p>Dear ${data.name || "Member"},</p>
        <p>Thank you for registering as a ${data.membershipType || "member"} with St. Gabriel Church.</p>
        <p>To complete your membership, please submit your membership fee of $${data.amount || "--"}.</p>
        ${data.checkoutUrl ? `<p><a href="${data.checkoutUrl}" style="${buttonStyles}">Complete Payment</a></p>` : ""}
        <p>If you have any questions about your membership or the payment process, please contact us.</p>
        <p>Blessings,<br>St. Gabriel Church Team</p>
        <div style="${footerStyles}">
          <p>St. Gabriel Ethiopian Orthodox Tewahedo Church<br>Silver Spring, MD</p>
        </div>
      </div>
    `,
    confirmed: (data: {
      name?: string;
      amount: number;
      currency: string;
      receiptUrl?: string;
    }) => `
      <div style="${baseStyles}${containerStyles}">
        <div style="${headerStyles}">
          <h1>Membership Payment Confirmed</h1>
        </div>
        <p>Dear ${data.name || "Member"},</p>
        <p>Thank you for your membership payment of ${new Intl.NumberFormat("en-US", { style: "currency", currency: data.currency }).format(data.amount / 100)}.</p>
        <p>Your membership is now active, and you can enjoy all the benefits of being a member of our church community.</p>
        ${data.receiptUrl ? `<p><a href="${data.receiptUrl}" style="${buttonStyles}">View Receipt</a></p>` : ""}
        <p>We look forward to seeing you at our services and events.</p>
        <p>Blessings,<br>St. Gabriel Church Team</p>
        <div style="${footerStyles}">
          <p>St. Gabriel Ethiopian Orthodox Tewahedo Church<br>Silver Spring, MD</p>
        </div>
      </div>
    `,
    adminNotification: (data: {
      name?: string;
      email?: string;
      amount: number;
      currency: string;
      receiptUrl?: string;
    }) => `
      <div style="${baseStyles}${containerStyles}">
        <div style="${headerStyles}">
          <h1>Membership Payment Received</h1>
        </div>
        <p>A membership payment has been received:</p>
        <ul>
          <li><strong>Member:</strong> ${data.name || data.email || "Anonymous"}</li>
          <li><strong>Amount:</strong> ${new Intl.NumberFormat("en-US", { style: "currency", currency: data.currency }).format(data.amount / 100)}</li>
          <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
        </ul>
        ${data.receiptUrl ? `<p><a href="${data.receiptUrl}" style="${buttonStyles}">View Receipt</a></p>` : ""}
        <p>Please update the member's status in the system if necessary.</p>
        <div style="${footerStyles}">
          <p>This is an automated notification from the St. Gabriel Church system.</p>
        </div>
      </div>
    `,
  },

  // Appointment request templates
  appointmentRequest: {
    user: (data: { name?: string; datetime?: string }) => `
      <div style="${baseStyles}${containerStyles}">
        <div style="${headerStyles}">
          <h1>Appointment Request Received</h1>
        </div>
        <p>Dear ${data.name || "Friend"},</p>
        <p>Thank you for requesting an appointment with St. Gabriel Church.</p>
        <p>We have received your request${data.datetime ? ` for ${data.datetime}` : ""} and will get back to you shortly to confirm the details.</p>
        <p>If you need to make any changes to your request, please contact us directly.</p>
        <p>Blessings,<br>St. Gabriel Church Team</p>
        <div style="${footerStyles}">
          <p>St. Gabriel Ethiopian Orthodox Tewahedo Church<br>Silver Spring, MD</p>
        </div>
      </div>
    `,
    admin: (data: {
      name?: string;
      email: string;
      phone?: string;
      datetime?: string;
      message?: string;
    }) => `
      <div style="${baseStyles}${containerStyles}">
        <div style="${headerStyles}">
          <h1>New Appointment Request</h1>
        </div>
        <p>A new appointment request has been submitted:</p>
        <ul>
          <li><strong>Name:</strong> ${data.name || "Not provided"}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Phone:</strong> ${data.phone || "Not provided"}</li>
          <li><strong>Requested Time:</strong> ${data.datetime || "Not specified"}</li>
        </ul>
        ${data.message ? `<p><strong>Message:</strong></p><p>${data.message}</p>` : ""}
        <p>Please review and respond to this request at your earliest convenience.</p>
        <div style="${footerStyles}">
          <p>This is an automated notification from the St. Gabriel Church system.</p>
        </div>
      </div>
    `,
  },

  // Donation templates
  donation: {
    thankYou: (data: {
      donorName?: string;
      amount: number;
      currency: string;
      purpose?: string;
      receiptUrl?: string;
      paymentMethod?: string;
      paymentId?: string;
      donationDate?: string;
    }) => `
      <div style="${baseStyles}${containerStyles}">
        <div style="${headerStyles}">
          <h1>Donation Processing Receipt</h1>
        </div>
        <p>Dear ${data.donorName || "Friend"},</p>
        <p>With a heart full of gratitude, we sincerely thank you for your generous donation to Debre Bisrat Dagimawi Kulibi St. Gabriel Ethiopian Orthodox Tewahedo Church.</p>
        <p>Your contribution is a blessing to our community and supports our mission to serve God and our congregation.</p>
        
        <div style="background-color: #f9f9f9; border: 1px solid #e0e0e0; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #8B0000;">Donation Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;"><strong>Donor Name:</strong></td>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;">${data.donorName || "Anonymous"}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;"><strong>Donation Type:</strong></td>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;">${data.purpose || "ይለግሱ (Donate)"}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;"><strong>Date:</strong></td>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;">${data.donationDate || new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;"><strong>Amount:</strong></td>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;">${new Intl.NumberFormat("en-US", { style: "currency", currency: data.currency }).format(data.amount / 100)}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;"><strong>Payment Method:</strong></td>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;">${data.paymentMethod || "Online Payment"}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Reference ID:</strong></td>
              <td style="padding: 5px 0;">${data.paymentId || ""}</td>
            </tr>
          </table>
        </div>
        
        <p>የሰጡት ልገሳ በእምነትና በፍቅር የተሞላ ነው። እግዚአብሔር ይባርክዎት።</p>
        <p>Your donation is received with faith and love. May God bless you abundantly.</p>
        
        ${data.receiptUrl ? `<p><a href="${data.receiptUrl}" style="${buttonStyles}">View Receipt</a></p>` : ""}
        
        <p>With sincere appreciation,<br>
        ደብረ ብሥራት ዳጊማዊ ቁልቢ ቅዱስ ገብርኤል የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን<br>
        Debre Bisrat Dagimawi Kulibi St. Gabriel Ethiopian Orthodox Tewahedo Church</p>
        
        <div style="${footerStyles}">
          <p>6020 Batson Rd, Burtonsville, MD 20868</p>
          <p>This donation may be tax-deductible. Please consult with your tax advisor.</p>
        </div>
      </div>
    `,
    adminNotification: (data: {
      donorName?: string;
      donorEmail: string;
      amount: number;
      currency: string;
      purpose?: string;
      receiptUrl?: string;
      paymentMethod?: string;
      paymentId?: string;
      donationDate?: string;
    }) => `
      <div style="${baseStyles}${containerStyles}">
        <div style="${headerStyles}">
          <h1>New Donation Received</h1>
        </div>
        <p>A new donation has been processed for the church:</p>
        
        <div style="background-color: #f9f9f9; border: 1px solid #e0e0e0; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #8B0000;">Donation Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;"><strong>Donor Name:</strong></td>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;">${data.donorName || "Anonymous"}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;"><strong>Donor Email:</strong></td>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;">${data.donorEmail || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;"><strong>Donation Type:</strong></td>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;">${data.purpose || "General Donation"}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;"><strong>Date:</strong></td>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;">${data.donationDate || new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;"><strong>Amount:</strong></td>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;">${new Intl.NumberFormat("en-US", { style: "currency", currency: data.currency }).format(data.amount / 100)}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;"><strong>Payment Method:</strong></td>
              <td style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;">${data.paymentMethod || "Online Payment"}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Reference ID:</strong></td>
              <td style="padding: 5px 0;">${data.paymentId || ""}</td>
            </tr>
          </table>
        </div>
        
        <p>This donation has been recorded in the system. Please verify the details in the admin dashboard.</p>
        ${data.receiptUrl ? `<p><a href="${data.receiptUrl}" style="${buttonStyles}">View Receipt</a></p>` : ""}
        
        <div style="${footerStyles}">
          <p>This is an automated notification from the St. Gabriel Church system.</p>
          <p>Debre Bisrat Dagimawi Kulibi St. Gabriel Ethiopian Orthodox Tewahedo Church<br>
          6020 Batson Rd, Burtonsville, MD 20868</p>
        </div>
      </div>
    `,
  },
};
