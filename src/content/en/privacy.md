# WalkieTokki Privacy Policy

**Effective date**: 2026-06-01
**Last updated**: 2026-05-31

> The Korean version of this Privacy Policy is the legally binding text under Korean law. This English version is a non-binding translation provided for the convenience of international users. In case of any conflict between the two, the Korean version prevails.

Wikid Production (hereinafter "the Company") establishes and discloses the following Privacy Policy in accordance with the Personal Information Protection Act, the Act on Promotion of Information and Communications Network Utilization and Information Protection, and other applicable laws, to protect Users' personal information and respect their rights.

---

## Article 1 (Items of Personal Information Collected)

### At Sign-up (required)

| Item | Source | Method |
|---|---|---|
| Email | Provided by Apple / Google / Kakao at sign-in | Automatic |
| Nickname | Entered by the User | Manual entry |
| Profile picture (optional) | Social provider | Automatic |
| Sign-up date / Last sign-in date | Recorded automatically by the system | Automatic |
| Social sign-in identifier (Apple/Google/Kakao uid) | Authentication flow | Automatic |

### Generated automatically while using the Service

| Item | Purpose |
|---|---|
| Ride records (channel code, start/end time, ride duration) | Display on the User's own screen (last 30 days) + usage aggregation |
| Weekly cumulative usage (minutes) | Free/Pro quota calculation |
| Pro launch notification email (optional) | Notify at Pro public launch |
| Account deletion reason (optional) | Service improvement statistics (anonymous) |

### Items NOT collected

- **Real-time GPS location data** (not collected)
- **Voice recordings** (PTT voice is transmitted only in real time; not stored on servers)
- **Contacts** (phone numbers, address book)
- **Payment card information** (handled directly by Apple/Google)
- **Health information**, **sensitive information**, **unique identifying information** (such as resident registration numbers)

### Automatically generated technical information

The Company does not collect real-time GPS location data. In the course of providing the Service, security, incident response, and connection establishment, technical information such as IP address, device information, access logs, and error logs may be automatically generated and processed; the Company does not use such information to track the User's location.

## Article 2 (Purposes of Collection and Use)

| Purpose | Items used | Retention period |
|---|---|---|
| Member identification and verification | Email, social uid | Until withdrawal |
| Service provision (channel join, PTT communication) | Nickname, social uid | Until withdrawal |
| Display of ride history | Ride records | Until withdrawal (anonymized upon withdrawal) |
| Pro usage quota management | Weekly usage minutes | Until withdrawal |
| Pro launch notification (optional consent) | Email | Until the notification is sent or consent is withdrawn |
| Fraud prevention, dispute resolution | Identifiers, access logs | Up to 3 months in accordance with applicable law |
| Service improvement (anonymous statistics) | Ride records (anonymized), deletion reasons | Permanent (aggregated form) |

## Article 3 (Retention and Use Period)

The Company applies the following retention periods by category.

| Category | Retention period |
|---|---|
| Firebase authentication, nickname, profile picture, sign-up date | Permanently deleted immediately upon withdrawal |
| Per-user ride record originals (including uid) | 30 days from creation or until withdrawal, whichever comes first |
| Anonymized ride statistics (after uid removal) | Retained for service improvement (irreversible de-identification) |
| Weekly cumulative usage | Deleted after the following week's quota calculation is complete (up to 30 days) |
| Pro launch notification email | Deleted immediately upon notification or consent withdrawal |
| Access logs and service usage records | Up to 3 months for fraud prevention and security |
| Display and advertising records | 6 months (Article 6 of the Act on Consumer Protection in Electronic Commerce) |
| Contract and subscription withdrawal records | 5 years (same Act, Article 6) |
| Payment and goods supply records | 5 years (same Act, Article 6) |
| Consumer complaint and dispute handling records | 3 years (same Act, Article 6) |

## Article 3-2 (Destruction Procedures and Methods)

**Destruction procedures**:
1. Personal information whose retention period has expired or whose processing purpose has been achieved is immediately classified for destruction.
2. Destruction is carried out after approval by the Personal Information Protection Officer.
3. The time and reason for destruction are recorded and managed.

**Destruction methods**:
1. Electronic files: destroyed by technical means that prevent recovery or reproduction (permanent database deletion and Firebase backup expiry).
2. Paper documents: shredded or incinerated (not applicable).

**Immediate processing upon withdrawal**:
- **Permanently deleted immediately**: Firebase authentication, nickname, profile picture, sign-up date
- **Retained as anonymized statistics**: ride records (uid replaced with an anonymous token)
- **Optional items deleted immediately**: Pro launch notification email

## Article 4 (Provision of Personal Information to Third Parties)

The Company does not provide Users' personal information to third parties, except in the following cases:

1. Where the User has given prior consent;
2. Where required by law or by a lawful request from an investigative authority.

## Article 5 (Entrustment of Personal Information Processing)

To provide the Service smoothly, the Company entrusts certain tasks to external specialists as follows:

| Trustee | Entrusted task | Data storage location |
|---|---|---|
| Google LLC (Firebase) | Member authentication, database, Cloud Functions, push notifications | **Seoul, Republic of Korea (asia-northeast3)** |
| Agora.io | Real-time voice communication processing | Entrusted processing (voice signal passes through transiently; not stored on servers) |
| Apple Inc. | iOS push tokens (PushToTalk Framework) | Apple iCloud infrastructure |
| Google LLC | Android push (Firebase Cloud Messaging) | Google infrastructure |
| Kakao Corp. | Social sign-in (at sign-up only) | Kakao infrastructure |

## Article 5-2 (Cross-Border Transfer of Personal Information)

The Company transfers personal information abroad only where the requirements of the Personal Information Protection Act and other applicable laws are met. Where overseas processing or storage is necessary for cloud, push notifications, real-time voice communication, or incident recovery, the Company discloses in this Policy the items transferred, the recipients, the destination countries, the times and methods of transfer, and the retention/use periods.

### Required cross-border transfers (essential for the Service)

| Items transferred | Recipient | Country | Time and method | Retention/use |
|---|---|---|---|---|
| Authentication tokens, ride records, nicknames | Google LLC (Firebase) | Seoul, Korea (asia-northeast3) in principle; the United States, etc. for incident recovery | Automatic HTTPS-encrypted transfer | Until withdrawal |
| iOS push tokens | Apple Inc. | United States | Automatic transfer via PushToTalk Framework | Until withdrawal or token expiry |
| Android push tokens | Google LLC | United States, etc. | Automatic transfer via FCM | Until withdrawal or token expiry |
| Real-time voice signals (not stored) | Agora.io | Korea, the United States, etc. (auto-routed) | Transient WebRTC pass-through | Discarded immediately upon call end |

### Optional cross-border transfers

WalkieTokki currently does not operate any optional cross-border transfer items.

### Right to refuse

- **Required transfers**: refusing may limit the relevant feature or use of the Service.
- **Optional transfers**: the User may refuse or withdraw consent at any time by contacting support@walkietokki.com.

## Article 6 (Rights of the User and How to Exercise Them)

Under the Personal Information Protection Act and other applicable laws, Users may request access to, correction or deletion of, suspension of processing of, or withdrawal of consent for their personal information. Where the right to data portability under applicable law applies, the Company processes the request within the scope and procedures specified by law.

| Right | How to exercise |
|---|---|
| Access | View your own data via the in-app "Profile" menu |
| Correction | "Profile → Change nickname" in the app, or request via support@walkietokki.com |
| Deletion | "Profile → Delete account" in the app |
| Suspension of processing | Request via support@walkietokki.com |
| Withdrawal of consent | Optional consent items (e.g., Pro launch notification) can be withdrawn at any time |

The rights of legal representatives are equally guaranteed.

## Article 6-2 (Protection of Children under 14)

1. The Company does not currently allow sign-up by children under 14, and the sign-up flow displays a checkbox confirming that the User is at least 14. Sign-up does not proceed without this confirmation.
2. If age-verification information such as date of birth is collected in the future, the items, purposes, and retention periods will be reflected in this Policy.
3. If personal information of a child under 14 is found to have been collected without the consent of a legal guardian, the Company will **delete it without delay**.
4. Legal guardians or the children themselves may request immediate deletion via support@walkietokki.com; the Company will process such requests within 10 days of receipt.

## Article 7 (Security Measures)

The Company implements the following measures:

1. **Technical measures**
   - All communications encrypted with HTTPS/TLS 1.2+
   - PTT voice data is protected with Agora SDK security features and transport-layer encryption (voice content is not stored on the Company's servers)
   - Session management based on Firebase Authentication tokens
   - **Agora channel access requires server-issued tokens** (signed using the App Certificate)
   - No direct password handling (social sign-in only)

2. **Administrative measures**
   - Minimum-privilege access to personal information (only operators access the Firebase Console)
   - Regular personal information protection training
   - Access logs for personal information processing systems are retained

3. **Physical measures**
   - Data center (Google Cloud Seoul) security facilities are entrusted

## Article 8 (Installation, Operation, and Refusal of Automatic Collection Devices)

WalkieTokki does not collect cookies or advertising identifiers (IDFA/AAID).

## Article 9 (Special Provisions on Voice Communication)

1. PTT voice is transmitted between riders in real time via Agora servers; **the voice itself is not stored on servers**.
2. The Company does not access the contents of communications, in accordance with the Protection of Communications Secrets Act.
3. Recording or distributing the voice of other riders within a channel without consent may constitute a violation of the Protection of Communications Secrets Act, and the responsibility rests with the User.

## Article 10 (Personal Information Protection Officer)

| Field | Information |
|---|---|
| Personal Information Protection Officer | Yohan Yoo |
| Title | Representative |
| Email | support@walkietokki.com |

Users may direct any inquiries, complaints, or requests for redress regarding personal information that arise from using the Service to the officer above.

## Article 11 (Remedies for Infringement of Rights)

For reports of personal information infringement or related counsel, please contact the bodies below:

- Personal Information Dispute Mediation Committee: (no area code) 1833-6972, [www.kopico.go.kr](https://www.kopico.go.kr)
- Personal Information Infringement Report Center: (no area code) 118, [privacy.kisa.or.kr](https://privacy.kisa.or.kr)
- Supreme Prosecutors' Office Cybercrime Investigation Unit: 02-3480-3573, [www.spo.go.kr](https://www.spo.go.kr)
- National Police Agency Cyber Bureau: (no area code) 182, [cyberbureau.police.go.kr](https://cyberbureau.police.go.kr)

## Article 12 (Changes to this Privacy Policy)

When this Policy is changed, the Company will give in-app or email notice at least 7 days in advance (30 days for material changes).

---

## History

| Version | Effective date | Changes |
|---|---|---|
| 1.0 | 2026-06-01 | First version |
