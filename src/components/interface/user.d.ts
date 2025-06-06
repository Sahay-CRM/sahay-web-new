interface User {
  token?: string;
  key?: string;
  employeeId: string;
  employeeName?: string;
  consultantId?: string;
  consultantName?: string;
  consultantMobile?: string;
  consultantEmail?: string;
  companyId?: string;
  companyCount?: string;
  companyName?: string;
  role?: string;
  photo?: string;
  pancard?: string;
  isSuperAdmin?: string;
  employeeMobile?: string;
  employeeEmail?: string;
  isSahayEmployee?: boolean;
  mobile?: string;
  companyLogo?: string;
}

interface UserDetails {
  photo: string | null;
  userName: string;
  userMobile: string;
  userEmail: string;
  role: string;
}
