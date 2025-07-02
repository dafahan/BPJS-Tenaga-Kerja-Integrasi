# Hospital-BPJS Billing System

A comprehensive billing management system for hospitals and BPJS (Indonesian health insurance) administration. This system facilitates the creation, management, and approval of medical invoices between hospitals and BPJS.

## 🏥 Features

### For Hospital Administrators (Admin RS)
- **Patient Management**: Register and manage patient information
- **Medical Records**: Create and maintain patient medical records
- **Master Data Management**: 
  - Categories for medical services
  - Medical services with pricing
  - Medicine inventory management
  - Medical actions/procedures
- **Invoice Creation**: Create invoices with detailed items or category-based billing
- **Invoice Submission**: Submit invoices to BPJS for approval

### For BPJS Administrators (Admin BPJS)
- **Invoice Review**: Review submitted invoices from hospitals
- **Approval/Rejection**: Approve or reject invoices with notes
- **Invoice Editing**: Edit invoices during review process
- **Monitoring**: Track all invoice statuses and amounts

### Shared Features
- **Dashboard**: Overview of system statistics and recent activities
- **Reports**: Comprehensive reporting for invoices and patients
- **Invoice Printing**: Professional invoice printing with hospital and BPJS logos
- **User Management**: Profile and password management
- **Role-based Access**: Different permissions for hospital and BPJS staff

## 🚀 Technology Stack

- **Backend**: Laravel 11 (PHP)
- **Frontend**: React 18 with Inertia.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: SweetAlert2
- **PDF Generation**: DomPDF
- **Database**: MySQL/PostgreSQL

## 📋 Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 18+ and NPM
- MySQL or PostgreSQL database

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hospital-bpjs-billing
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=hospital_bpjs
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. **Generate application key**
   ```bash
   php artisan key:generate
   ```

6. **Run migrations**
   ```bash
   php artisan migrate
   ```

7. **Seed the database**
   ```bash
   php artisan db:seed
   ```

8. **Build assets**
   ```bash
   npm run build
   ```

9. **Start the development server**
   ```bash
   php artisan serve
   ```

## 👥 Default Users

After seeding, you can login with:

**Hospital Administrator:**
- Username: `admin_rs`
- Password: `password`

**BPJS Administrator:**
- Username: `admin_bpjs`
- Password: `password`

## 📊 Database Structure

### Core Tables
- `users` - System users (Hospital and BPJS admins)
- `patients` - Patient information (KPJ, NIK, personal data)
- `medical_records` - Medical treatment records
- `categories` - Service categories
- `services` - Medical services with pricing
- `medicines` - Medicine inventory
- `actions` - Medical procedures/actions

### Billing Tables
- `invoices` - Main invoice records with JKK dates
- `invoice_details` - Detailed invoice items (services, medicines, actions)
- `invoice_categories` - Category-based billing

## 🔐 User Roles

### Admin Rumah Sakit (Hospital Admin)
- Manage patients and medical records
- Create and edit invoices
- Manage master data (categories, services, medicines, actions)
- Submit invoices to BPJS
- Generate reports

### Admin BPJS
- Review submitted invoices
- Approve or reject invoices
- Edit invoices during review
- Generate invoice reports
- Monitor payment statuses

## 📝 Invoice Workflow

1. **Draft**: Hospital creates invoice (can edit/delete)
2. **Submitted**: Hospital submits to BPJS (cannot edit)
3. **Under Review**: BPJS reviews invoice (can edit)
4. **Approved**: BPJS approves invoice
5. **Rejected**: BPJS rejects with notes (returns to hospital)

## 🎨 Key Features Explained

### JKK Date (Jaminan Kecelakaan Kerja)
- Required for all invoices
- Represents work accident insurance date
- Critical for BPJS claim processing

### Flexible Invoice Creation
- **Item-based**: Add individual services, medicines, and actions
- **Category-based**: Bulk billing by service categories
- **Mixed**: Combine both approaches in single invoice

### Comprehensive Reporting
- Invoice analytics with status breakdowns
- Patient demographics and treatment history
- Revenue tracking and trends
- Export capabilities (CSV)

## 📱 Responsive Design

The system is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔧 Development

### Running in development mode
```bash
# Terminal 1: PHP server
php artisan serve

# Terminal 2: Asset compilation
npm run dev
```

### Building for production
```bash
npm run build
php artisan optimize
```

## 📄 Invoice Printing

The system generates professional PDF invoices featuring:
- Hospital and BPJS logos
- Complete patient information
- Detailed billing breakdown
- JKK date and approval status
- Digital signatures support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For technical support or questions about the Hospital-BPJS Billing System, please contact the development team.

## 📜 License

This project is proprietary software developed for hospital-BPJS billing management.

---

**System Requirements:**
- Minimum PHP 8.1
- MySQL 8.0+ or PostgreSQL 13+
- 2GB RAM minimum
- SSL certificate recommended for production

**Browser Support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+