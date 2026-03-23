# User Import Feature Guide

## Overview
This feature allows you to import multiple users from an Excel file with the following details:
- Username
- Email
- Auto-generated random 16-character password
- User role assigned
- Email notification sent to each user

## Setup Instructions

### 1. Configure Mailtrap Credentials
Update `utils/sendMailHandler.js` with your Mailtrap credentials:

```javascript
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    secure: false,
    auth: {
        user: "your_mailtrap_user",      // Replace with your Mailtrap username
        pass: "your_mailtrap_password",  // Replace with your Mailtrap password
    },
});
```

**To get Mailtrap credentials:**
1. Go to https://mailtrap.io/
2. Sign up or log in
3. Go to Inbox → Credentials
4. Copy the SMTP credentials

### 2. Excel File Format
Create an Excel file with the following structure:

| Column A  | Column B     |
|-----------|------------|
| username  | email      |
| john123   | john@email.com |
| jane456   | jane@email.com |
| mike789   | mike@email.com |

**Requirements:**
- First row must be headers (username, email)
- Column A: Username (must be unique)
- Column B: Email (must be unique and valid)
- File must be in `.xlsx` format

### 3. Using the Import Endpoint

**Endpoint:** `POST /api/v1/users/import/excel`

**Request:**
- Content-Type: form-data
- File parameter: `file` (the Excel file)
- Authentication: Required (admin/moderator)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/users/import/excel \
  -F "file=@your_file.xlsx" \
  -H "Authorization: Bearer your_token"
```

**Using Postman:**
1. Create a POST request to `http://localhost:3000/api/v1/users/import/excel`
2. Go to "Body" → Select "form-data"
3. Add a key "file" with type "File"
4. Upload your Excel file
5. Add Authorization header with your token
6. Send the request

### 4. Response Format

**Success Response:**
```json
{
  "message": "Import completed",
  "total": 3,
  "results": [
    {
      "username": "john123",
      "email": "john@email.com",
      "password": "Abc123!@#$%^&*",
      "status": "success",
      "message": "User created and email sent"
    },
    {
      "username": "jane456",
      "email": "jane@email.com",
      "password": "Xyz789!@#$%^&*",
      "status": "success",
      "message": "User created and email sent"
    }
  ]
}
```

**Status Types:**
- `success`: User created and password email sent
- `success_no_email`: User created but email failed to send
- `failed`: User creation failed

## Features

1. **Random Password Generation**: Each user gets a unique 16-character password containing uppercase, lowercase, numbers, and special characters
2. **Email Notification**: Password is automatically sent to user's email
3. **Duplicate Detection**: Prevents creating users with duplicate username or email
4. **Batch Processing**: Import multiple users in one operation
5. **Error Handling**: Detailed error messages for failed imports
6. **Auto Role Assignment**: All imported users are assigned the "user" role

## Testing

1. Create a "user" role in the database if not exists
2. Prepare your Excel file with sample data
3. Set up Mailtrap credentials
4. Use the import endpoint to import users
5. Check Mailtrap inbox to verify emails were sent

## Troubleshooting

**"User role not found in database"**
- Create a role with name "user" in the roles collection

**"No valid user data found in Excel file"**
- Ensure Excel file has data in columns A (username) and B (email)
- Check that headers are in row 1

**"Username already exists" / "Email already exists"**
- The username/email already exists in database
- Use a different username or email for the new user

**Emails not received**
- Check Mailtrap credentials are correct
- Verify email addresses in Excel file are valid
- Check Mailtrap spam/trash folders
