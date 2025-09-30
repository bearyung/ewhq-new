# EWHQ API CLI Commands

## Super Admin Seed Command

This command creates the initial super admin user for the EWHQ system. This should be run after setting up the database but before deploying the application.

### Prerequisites

1. Ensure PostgreSQL is running and accessible
2. Configure your `.env` file with database connection details
3. Run database migrations first (if needed)

### Usage

```bash
# Basic usage with auto-generated password
dotnet run seed-admin --email <email> --first-name <firstName> --last-name <lastName>

# With custom password
dotnet run seed-admin --email <email> --first-name <firstName> --last-name <lastName> --password <password>
```

### Parameters

- `--email` (required): Email address for the super admin account
- `--first-name` (required): First name of the super admin
- `--last-name` (required): Last name of the super admin
- `--password` (optional): Custom password. If not provided, a secure password will be generated

### Examples

```bash
# Create super admin with auto-generated password
dotnet run seed-admin --email admin@ewhq.com --first-name System --last-name Administrator

# Create super admin with custom password
dotnet run seed-admin --email admin@ewhq.com --first-name John --last-name Doe --password MySecureP@ssw0rd!
```

### Output

Successful execution will display:
```
Creating super admin user...
Email: admin@ewhq.com
Name: System Administrator

✅ Super admin created successfully!

📧 Email: admin@ewhq.com
🔑 Password: <generated-or-provided-password>

⚠️  IMPORTANT: Save this password securely. It will not be shown again!
⚠️  Please change this password after your first login.
```

### Security Notes

1. **Password Requirements**:
   - Minimum 6 characters
   - Must contain at least one digit
   - Must contain at least one uppercase letter
   - Must contain at least one lowercase letter

2. **Best Practices**:
   - Run this command only in a secure environment
   - Never share or log the generated password
   - Change the password immediately after first login
   - Consider enabling MFA for the super admin account

3. **Roles Created**:
   The seeder will automatically create the following roles if they don't exist:
   - SuperAdmin
   - Admin
   - Reseller
   - Distributor

### Troubleshooting

**Error: "Super admin with email 'xxx' already exists"**
- A super admin with this email already exists in the system
- Use a different email or remove the existing user from the database

**Error: "Failed to create super admin: [error details]"**
- Check that the password meets all requirements
- Ensure the database connection is properly configured
- Verify that the Identity tables have been created

**Database Connection Issues**
- Verify your `.env` file has correct database settings:
  ```
  DB_PROVIDER=PostgreSQL
  DB_SERVER=localhost
  DB_PORT=5432
  DB_NAME=ewhq_main
  DB_USER=your_user
  DB_PASSWORD=your_password
  
  IDENTITY_DB_NAME=ewhq_identity
  ```

### Running in Production

For production environments, consider:

1. Using environment variables instead of command line arguments for sensitive data
2. Running the command as part of your deployment pipeline
3. Storing the generated password in a secure password manager
4. Implementing additional security measures like IP restrictions