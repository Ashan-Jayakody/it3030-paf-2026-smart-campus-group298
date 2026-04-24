# it3030-paf-2026-smart-campus-group142

The **SmartCampus** project is a comprehensive full-stack solution designed for university campus management. It streamlines the process of booking campus facilities (lecture halls, labs, equipment) and managing maintenance incidents through a centralized digital platform.

##  Installation & Setup

#### Clone the ropository 
`https://github.com/Ashan-Jayakody/it3030-paf-2026-smart-campus-group142.git`

### Backend (Spring Boot)
1. Configure `application.properties` with your database credentials and Google OAuth Client ID/Secret.
2. Run `cd server`
3. Run `./mvnw spring-boot:run`.
4. Server defaults to `http://localhost:8081`.

### Frontend (React/Vite)
1. Run `npm install` to install dependencies.
2. Run `cd frontend`
3. Run `npm run dev`.

## Contributors
- **IT23362376:** Facilities catalogue + resource management endpoints
- **IT23347526:** Booking workflow + conflict checking
- **Member 3:** Incident tickets + attachments + technician updates
- **Member 4:** Notifications + role management + OAuth integration
