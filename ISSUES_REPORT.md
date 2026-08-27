# Parent-Teacher Platform - Issues Report

**Report Date**: 2026-08-27  
**Status**: Issues Identified and Fixed

---

## Summary
Total Issues Found: **4**
- **Critical/High Severity**: 2 (FIXED ✅)
- **Medium Severity**: 1 (IDENTIFIED ⚠️)
- **Low Severity**: 1 (IDENTIFIED ⚠️)

---

## Critical Issues (FIXED ✅)

### Issue #1: Missing Database Connection Configuration
**Severity**: 🔴 HIGH  
**Category**: Backend Configuration  
**File(s)**: `backend/src/main/resources/application.properties`

**Problem:**
The application.properties file was missing essential database connection properties:
- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`

While Docker environment variables were set in `docker-compose.yml`, the standalone application would fail to connect to the database.

**Impact**: 
- Application fails to start when running outside Docker without manual environment variable setup
- Database operations would not work in local development

**Fix Applied:**
Added environment-variable-aware properties with sensible defaults:
```properties
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/gradevault}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:vault_admin}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:password}
```

**Status**: ✅ RESOLVED

---

### Issue #2: Missing CORS Configuration
**Severity**: 🔴 HIGH  
**Category**: Backend Security/API  
**File(s)**: `backend/src/main/java/com/vault/config/SecurityConfig.java`

**Problem:**
The Spring Security configuration did not include CORS (Cross-Origin Resource Sharing) settings. The frontend makes requests from `http://localhost:3000` to the backend API, which would be blocked by browser CORS policies.

**Technical Details:**
- Frontend at `localhost:3000` or behind nginx at `localhost:80`
- Backend API at `localhost:8080`
- No `@CrossOrigin` annotations on controllers
- No `CorsConfigurationSource` bean in security config

**Impact**:
- Frontend cannot communicate with backend due to CORS policy violations
- Login/registration endpoints return CORS errors
- Academic endpoints inaccessible from frontend
- Application completely non-functional in browser

**Fix Applied:**
Created comprehensive CORS configuration:
- Added `CorsConfigurationSource` bean
- Configured allowed origins: `http://localhost:3000`, `http://localhost`, `http://localhost:80`
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed all headers
- Enabled credentials
- Set max age to 3600 seconds

**Status**: ✅ RESOLVED

---

## Medium Severity Issues (⚠️ IDENTIFIED)

### Issue #3: Hardcoded Database Credentials in Docker Compose
**Severity**: 🟡 MEDIUM  
**Category**: Security  
**File(s)**: `docker-compose.yml`

**Problem:**
Database credentials are hardcoded in `docker-compose.yml`:
```yaml
SPRING_DATASOURCE_PASSWORD: SuperSecurePassword2026!
POSTGRES_PASSWORD: SuperSecurePassword2026!
```

**Impact**:
- Credentials exposed in version control
- Security risk if file is accidentally committed
- Cannot change passwords without modifying source code
- Not suitable for production deployments

**Recommended Fix**:
Use an `.env` file:
```bash
# Create .env file at project root
SPRING_DATASOURCE_PASSWORD=SuperSecurePassword2026!
POSTGRES_PASSWORD=SuperSecurePassword2026!
```

Reference in docker-compose.yml:
```yaml
environment:
  SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

Add `.env` to `.gitignore`

**Status**: ⚠️ IDENTIFIED (Not fixed - requires operational change)

---

## Low Severity Issues (⚠️ IDENTIFIED)

### Issue #4: Unused User Entity
**Severity**: 🟢 LOW  
**Category**: Code Quality  
**File(s)**: `backend/src/main/java/com/vault/entity/User.java`

**Problem:**
A `User` entity is defined in the codebase but is:
- Never used in any repository
- Never referenced in controllers
- Never instantiated in the DataSeeder
- Redundant with Student, Teacher, and Parent entities

**Code Evidence:**
The entity exists at `backend/src/main/java/com/vault/entity/User.java` with properties for:
- username, password, fullName, role, linkedStudentUsername

But the actual authentication system uses:
- `StudentRepository.findByStudentId()`
- `TeacherRepository.findByTeacherId()`
- `ParentRepository.findByParentId()`

**Impact**:
- Code confusion for developers
- Unnecessary database table created
- Maintenance overhead
- Architectural inconsistency

**Recommended Fix**:
Either:
1. **Option A**: Remove the User entity entirely (recommended - system is role-specific)
2. **Option B**: Refactor to use User entity as base class for Student, Teacher, Parent (significant refactoring)

**Status**: ⚠️ IDENTIFIED (Architectural decision required)

---

## Verification Checklist

### Database Configuration
- [x] `spring.datasource.url` configured
- [x] `spring.datasource.username` configured
- [x] `spring.datasource.password` configured
- [x] Fallback values provided for development

### CORS Configuration
- [x] `CorsConfigurationSource` bean created
- [x] Allowed origins configured
- [x] Allowed methods configured
- [x] Credentials enabled
- [x] CORS integrated into `SecurityFilterChain`

### Security Configuration
- [ ] Use environment variables for passwords
- [ ] Remove hardcoded credentials from version control
- [ ] Consider adding SSL/TLS configuration for production

### Code Quality
- [ ] Decide on User entity fate
- [ ] Remove or integrate User entity
- [ ] Update documentation if architecture changes

---

## Testing Recommendations

1. **Backend Startup Test**
   ```bash
   cd backend
   mvn clean package
   java -jar target/grade-vault-backend-0.0.1-SNAPSHOT.jar
   ```

2. **Database Connectivity Test**
   ```bash
   curl http://localhost:8080/api/health
   ```

3. **CORS Test**
   ```javascript
   // From browser console at frontend URL
   fetch('http://localhost:8080/api/health')
       .then(r => r.json())
       .then(d => console.log(d))
   ```

4. **End-to-End Test**
   - Docker Compose with: `docker-compose up`
   - Navigate to login page
   - Test student login with S-1001 / pass123
   - Test teacher login with T-1001 / pass123
   - Test parent login with P-1001 / pass123

---

## Additional Notes

### Architecture Overview
- **Frontend**: Next.js 14.2.3 (React) on port 3000
- **Backend**: Spring Boot 3.2.4 with PostgreSQL on port 8080
- **Proxy**: Nginx serving frontend and proxying API requests
- **Database**: PostgreSQL 15 Alpine

### Environment Details
- Java: 17
- Node.js: Not specified in package.json (likely 18+)
- Maven: 3.9.6
- Docker Compose: v2.x or v3.x

---

## Summary of Changes Made

| File | Change | Reason |
|------|--------|--------|
| `application.properties` | Added datasource configuration | Enable DB connection outside Docker |
| `SecurityConfig.java` | Added CORS bean and configuration | Fix cross-origin API calls |

---

**End of Report**
