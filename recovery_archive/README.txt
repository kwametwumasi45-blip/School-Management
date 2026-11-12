EMENA DASHBOARD FILES

This package contains:
- public/index.html
- public/css/style.css
- public/js/app.js

INSTALLATION
1. Stop the Node server with Ctrl+C in its PowerShell window.
2. Open a NEW PowerShell window and run:
   cd C:\Users\USER\Emena-School-System
3. Make a backup of your current frontend files:
   Copy-Item .\public\login.html .\public\login-backup.html -ErrorAction SilentlyContinue
   Copy-Item .\public\js\app.js .\public\js\app-backup.js -ErrorAction SilentlyContinue
4. Extract this ZIP. Copy the package's public folder contents into:
   C:\Users\USER\Emena-School-System\public
   Allow replacement of app.js and style.css if asked.
5. Make sure index.html is placed directly in the public folder.
6. Start the server:
   npm.cmd start
7. Open http://localhost:3000/login and sign in.

IMPORTANT
- These files do not modify or delete the SQLite database.
- The dashboard uses same-origin requests and includes the browser session cookie.
- Each module expects the API paths already mounted by your server:
  /api/students, /api/teachers, /api/classes, /api/subjects,
  /api/attendance, /api/examinations, /api/fees, /api/reports, /api/settings.
- This is a connected dashboard shell and record viewer. It does not yet add/edit/delete records; those forms must match the exact validation and field names in each existing route.
- If a module shows an API error, copy the exact message and share it so the matching route can be fixed without touching existing records.
