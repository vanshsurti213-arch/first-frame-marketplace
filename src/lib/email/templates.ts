// ============================================================
// Firstframe V1 — Email Templates
// Text-forward, dark background, lime accent. Mobile-first.
// ============================================================

const baseStyles = `
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #0A0A0A;
  color: #FFFFFF;
  padding: 40px 20px;
  max-width: 560px;
  margin: 0 auto;
`;

const accentColor = "#E8FF47";
const mutedColor = "#6B6B6B";

function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0A0A0A;">
      <div style="${baseStyles}">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 20px; font-weight: 700; color: ${accentColor}; letter-spacing: -0.5px;">
            firstframe
          </span>
        </div>
        ${content}
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08);">
          <p style="font-size: 12px; color: ${mutedColor}; margin: 0;">
            This email was sent by Firstframe. If you have questions, reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function ctaButton(text: string, url: string): string {
  return `
    <a href="${url}" style="
      display: inline-block;
      background-color: ${accentColor};
      color: #0A0A0A;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      margin-top: 16px;
    ">${text}</a>
  `;
}

// ---- Template Functions ----

export function creatorAddedToCampaign(creatorName: string, campaignName: string, dashboardUrl: string): string {
  return emailWrapper(`
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      You've been added to a campaign
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 8px;">
      Hi ${creatorName},
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 16px;">
      You've been approved to join <strong>${campaignName}</strong>. Head to your dashboard to see what's next.
    </p>
    ${ctaButton("Go to Dashboard", dashboardUrl)}
  `);
}

export function productActivated(creatorName: string, productName: string, dashboardUrl: string): string {
  return emailWrapper(`
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      A new product is ready
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 8px;">
      Hi ${creatorName},
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 16px;">
      <strong>${productName}</strong> is now active. Please choose your preferred variant and confirm your shipping address.
    </p>
    ${ctaButton("Choose Your Preference", dashboardUrl)}
  `);
}

export function scriptUploaded(creatorName: string, productName: string, dashboardUrl: string): string {
  return emailWrapper(`
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      Your brief is ready
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 8px;">
      Hi ${creatorName},
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 16px;">
      The brief for <strong>${productName}</strong> has been uploaded. Please review it before filming.
    </p>
    ${ctaButton("View Brief", dashboardUrl)}
  `);
}

export function scriptUpdated(creatorName: string, productName: string, version: number, dashboardUrl: string): string {
  return emailWrapper(`
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      Brief updated — please review
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 8px;">
      Hi ${creatorName},
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 16px;">
      The brief for <strong>${productName}</strong> has been updated to version ${version}. Please review the changes before filming.
    </p>
    ${ctaButton("Review Updated Brief", dashboardUrl)}
  `);
}

export function productDispatched(creatorName: string, productName: string, trackingLink: string | null): string {
  return emailWrapper(`
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      Your product is on its way
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 8px;">
      Hi ${creatorName},
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 16px;">
      <strong>${productName}</strong> has been dispatched and is on its way to you.
    </p>
    ${trackingLink ? ctaButton("Track Shipment ↗", trackingLink) : ""}
  `);
}

export function revisionRequested(creatorName: string, productName: string, feedback: string, dashboardUrl: string): string {
  return emailWrapper(`
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      Feedback on your submission
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 8px;">
      Hi ${creatorName},
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 16px;">
      Your submission for <strong>${productName}</strong> needs a revision. Here's the feedback:
    </p>
    <div style="
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 3px solid #F59E0B;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    ">
      <p style="font-size: 14px; line-height: 1.6; color: #E0E0E0; margin: 0;">
        "${feedback}"
      </p>
    </div>
    ${ctaButton("Resubmit Content", dashboardUrl)}
  `);
}

export function contentApproved(creatorName: string, productName: string): string {
  return emailWrapper(`
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      Your content has been approved ✓
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 8px;">
      Hi ${creatorName},
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 16px;">
      Great news! Your content for <strong>${productName}</strong> has been approved. Thank you for your work.
    </p>
    <div style="
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      margin: 16px 0;
    ">
      <span style="font-size: 32px;">✓</span>
      <p style="font-size: 14px; color: #22C55E; margin: 8px 0 0;">Content Approved</p>
    </div>
  `);
}

export function newInvitePending(adminName: string, creatorName: string, campaignName: string, brandName: string, adminUrl: string): string {
  return emailWrapper(`
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      New invite pending approval
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 8px;">
      Hi ${adminName},
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 16px;">
      <strong>${brandName}</strong> has invited <strong>${creatorName}</strong> to <strong>${campaignName}</strong>. Please review and approve/reject.
    </p>
    ${ctaButton("Review Invite", adminUrl)}
  `);
}

export function newSubmissionReady(recipientName: string, creatorName: string, productName: string, reviewUrl: string): string {
  return emailWrapper(`
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      New submission ready for review
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 8px;">
      Hi ${recipientName},
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 16px;">
      <strong>${creatorName}</strong> has submitted content for <strong>${productName}</strong>. It's ready for your review.
    </p>
    ${ctaButton("Review Submission", reviewUrl)}
  `);
}

export function creatorMagicLink(creatorName: string, joinUrl: string): string {
  return emailWrapper(`
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px;">
      Welcome to Firstframe
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 8px;">
      Hi ${creatorName},
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #E0E0E0; margin: 0 0 16px;">
      You've been invited to join Firstframe as a creator. Click the button below to access your dashboard.
    </p>
    ${ctaButton("Join Firstframe", joinUrl)}
    <p style="font-size: 12px; color: ${mutedColor}; margin-top: 24px;">
      This link is unique to you. Do not share it with anyone.
    </p>
  `);
}
