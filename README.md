# Class Attendance System - Cal State San Marcos

A location-verified attendance system that uses GPS geolocation to ensure students are physically on campus when marking attendance.

## Features

- **Location Verification**: Students must be within Cal State San Marcos campus boundaries to check in
- **Real-time Attendance**: Instructors can start/stop attendance sessions and see check-ins in real-time
- **Automated Geofencing**: Automatic validation of student locations against campus coordinates
- **Simple Interface**: Easy-to-use web interface accessible from any device
- **No Account Required**: Students only need to enter their name to check in

## How It Works

### For Students
1. Navigate to the attendance page when your instructor starts a session
2. Select your class from the dropdown
3. Enter your name
4. Click "Check In" - your location will be captured and verified automatically
5. Get instant confirmation if you're on campus

### For Instructors
1. Go to the Instructor Dashboard
2. Create your classes (one-time setup)
3. Start an attendance session when class begins
4. Students can now check in from the student page
5. View real-time attendance and see who checked in
6. End the session when done

## Tech Stack

- **Frontend**: Next.js 14 with React and TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **Styling**: Tailwind CSS
- **ORM**: Prisma
- **Geolocation**: Browser Geolocation API with custom validation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Class-Attendance
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel (Easiest Option - Recommended)

Vercel provides free hosting for Next.js applications with automatic deployments from GitHub.

### Step-by-Step Deployment:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"
   - Done! Your app will be live in ~2 minutes

3. **Set up Production Database** (Optional - for more than testing):
   - For production use, connect a PostgreSQL database
   - Vercel works great with [Supabase](https://supabase.com) (free tier available)
   - Or use [Neon](https://neon.tech) (free tier available)
   - Add your database URL as an environment variable in Vercel settings

4. **Update Database Connection** (if using PostgreSQL):
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add: `DATABASE_URL` with your PostgreSQL connection string
   - Update `prisma/schema.prisma`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Redeploy

### Alternative: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" > "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-deploy

## Campus Geofencing

The system is pre-configured with Cal State San Marcos campus boundaries:
- **Center Point**: 33.1267°N, 117.1610°W
- **Coverage Radius**: 1.5km from campus center
- **Boundary**: Rectangular polygon covering main campus

To modify for a different campus, edit `/lib/geolocation.ts`:
- Update `CSUSM_CAMPUS_BOUNDARY` coordinates
- Update `CSUSM_CENTER` coordinates
- Adjust `MAX_DISTANCE_KM` if needed

## Database Schema

- **Class**: Stores class information (name, code)
- **AttendanceSession**: Tracks attendance sessions (start time, end time, active status)
- **AttendanceRecord**: Individual student check-ins (name, location, timestamp, validation status)

## Project Structure

```
Class-Attendance/
├── app/
│   ├── api/              # API routes
│   │   ├── attendance/   # Check-in endpoint
│   │   ├── classes/      # Class management
│   │   └── sessions/     # Session management
│   ├── instructor/       # Instructor dashboard
│   ├── page.tsx          # Student check-in page
│   └── layout.tsx        # App layout
├── lib/
│   ├── geolocation.ts    # Location validation logic
│   └── db.ts             # Database client
├── prisma/
│   └── schema.prisma     # Database schema
└── package.json
```

## Security & Privacy

- Location data is only used for attendance verification
- No persistent tracking of student locations
- Only checks if student is on campus (yes/no)
- Location coordinates are stored only for verification audit trail
- No authentication required keeps it simple (add auth if needed for your use case)

## Future Enhancements

Possible improvements:
- Add instructor authentication
- Export attendance to CSV
- Email notifications for attendance
- Mobile app version
- Integration with campus LMS
- QR code check-in as backup
- Multiple campus support

## Troubleshooting

**Location not working?**
- Ensure HTTPS is enabled (required for geolocation)
- Check browser location permissions
- Try on a different browser
- Make sure GPS is enabled on mobile devices

**Students can't check in?**
- Verify they're on campus
- Check if attendance session is active
- Ensure they haven't already checked in
- Check their location permissions

**Database errors?**
- Run `npx prisma generate` to regenerate Prisma client
- Run `npx prisma db push` to sync schema
- Check database connection string

## License

MIT License - feel free to use and modify for your institution!

## Support

For issues or questions, please open an issue on GitHub or contact your system administrator.
