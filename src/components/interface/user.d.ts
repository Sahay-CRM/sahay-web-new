interface User extends Partial<EmployeeDetailsById> {
  token?: string;
  fbToken?: string;
  key?: string;
  employeeId: string;
  employeeName?: string;
  employeeMobile?: string;
  employeeEmail?: string;
  employeeType?: string;
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
  isSuperAdmin?: boolean | string;
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
