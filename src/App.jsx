import { useState } from 'react';
import axios from 'axios';
import './App.css';
import { useNavigate } from 'react-router-dom';


const API = axios.create({
  baseURL: 'https://bynd-backend-owi6.onrender.com/api',
  withCredentials: true
});

function App() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form States
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ fullname: '', email: '', phone: '', password: '', role: 'user', specialization: [] });
  const [loanData, setLoanData] = useState({ name: '', dob: '', email: '', loanAmount: '', employee: 'Salaried', pancard: '', mobile: '' });

  // Helper alert setter
  const showAlert = (type, text) => {
    setMessage({ type, text: Array.isArray(text) ? text.join(', ') : text });
  };

  // Submit Handlers
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', loginData);
      const userRole = res.data.data.role;
      console.log('User Role:', userRole);
      if (userRole === "admin" || userRole === "ceo" || userRole === "crm") {
        showAlert('success', `Login successful! Redirecting as ${userRole.toUpperCase()}...`);

        // Redirect target driven by VITE_DASHBOARD_URL env variable — falls back to the production Vercel deployment.
        setTimeout(() => {
          window.location.replace(`${import.meta.env.VITE_DASHBOARD_URL}`);
        }, 1000);

      } else if (userRole === "employeeType") {
        showAlert("error", "employeeTypes are not allowed to access the management dashboard.");
      }
      else if (userRole === "employee") {
        showAlert('success', `Login successful! Redirecting as ${userRole.toUpperCase()}...`);

        // Redirect target driven by VITE_EMPLOYEE_URL env variable — falls back to the production Vercel deployment.
        setTimeout(() => {
          window.location.replace(`${import.meta.env.VITE_EMPLOYEE_URL}`);
        }, 1000);
      }
      else {
        showAlert("error", "Standard Users are not allowed to access the management dashboard.");
      }

    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Login failed.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/register', registerData);
      if (res.data.success) {
        showAlert('success', 'Registration successful! You can log in now.');
        setActiveTab('login');
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Registration failed.');
    }
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...loanData,
        loanAmount: parseFloat(loanData.loanAmount)
      };
      const res = await API.post('/loans/submit-lead', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.data.success) {
        showAlert('success', 'Application processed and transferred to Ramfincorp successfully!');
      }
    } catch (err) {
      const errorDetails = err.response?.data?.errors || err.response?.data?.message || 'Submission failed.';
      showAlert('error', errorDetails);
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Navigation Header tabs */}
      <header className="form-header">
        <button className={activeTab === 'login' ? 'active-btn' : ''} onClick={() => { setActiveTab('login'); setMessage({ type: '', text: '' }); }}>Login</button>
        <button className={activeTab === 'register' ? 'active-btn' : ''} onClick={() => { setActiveTab('register'); setMessage({ type: '', text: '' }); }}>Register</button>
        <button className={activeTab === 'loan' ? 'active-btn' : ''} onClick={() => { setActiveTab('loan'); setMessage({ type: '', text: '' }); }}>Ramfincorp Lead</button>
      </header>

      {/* Global Status Banner Alert */}
      {message.text && (
        <div className={`alert-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Main UI Container Blocks */}
      <main className="form-card">

        {/* LOGIN VIEW */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <h2>Account Login</h2>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" required value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} placeholder="Enter email" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" required value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} placeholder="Enter password" />
            </div>
            <button type="submit" className="submit-btn">Sign In</button>
          </form>
        )}

        {/* REGISTER VIEW */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <h2>Create Account</h2>
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" required value={registerData.fullname} onChange={(e) => setRegisterData({ ...registerData, fullname: e.target.value })} placeholder="First and last name" />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" required value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} placeholder="name@example.com" />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input type="tel" required value={registerData.phone} onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} placeholder="Mobile number" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" required value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} placeholder="Create secure password" />
            </div>
            <div className="input-group">
              <label>System Role</label>
              <select value={registerData.role} onChange={(e) => setRegisterData({ ...registerData, role: e.target.value, specialization: [] })}>
                <option value="user">User</option>
                <option value="employee">employee</option>
                <option value="crm">CRM</option>
                <option value="ceo">CEO</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Specialization field displayed when role is employee */}
            {registerData.role === 'employee' && (
              <>
                <div className="input-group">
                  <label>Specialization(s)</label>
                  <select value="" onChange={(e) => {
                    const selected = e.target.value;
                    if (!selected) return;
                    const current = registerData.specialization || [];
                    if (!current.includes(selected)) {
                      setRegisterData({ ...registerData, specialization: [...current, selected] });
                    }
                  }}>
                    <option value="" disabled>Select specialization</option>
                    <option value="home-loan">Home Loan</option>
                    <option value="vehicle-loan">Vehicle Loan</option>
                    <option value="medical-loan">Medical Loan</option>
                    <option value="loan-against-property">Loan Against Property</option>
                    <option value="loan-against-share">Loan Against Share</option>
                    <option value="education-loan">Education Loan</option>
                    <option value="supply-chain">Supply Chain</option>
                    <option value="credit-card">Credit Card</option>
                    <option value="equity">Equity</option>
                    <option value="mutual-fund">Mutual Fund</option>
                    <option value="general-insurance">General Insurance</option>
                    <option value="life-insurance">Life Insurance</option>
                  </select>
                </div>

                {/* Render selected specializations as badges */}
                <div className="badge-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px', marginBottom: '15px' }}>
                  {(registerData.specialization || []).map((spec, idx) => (
                    <span key={idx} className="badge" style={{ display: 'inline-flex', alignItems: 'center', background: '#e2e8f0', padding: '4px 10px', borderRadius: '16px', fontSize: '13px', color: '#334155', fontWeight: '500' }}>
                      {spec.replace('-', ' ')}
                      <span className="close" style={{ marginLeft: '8px', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }} onClick={() => {
                        const filtered = (registerData.specialization || []).filter(s => s !== spec);
                        setRegisterData({ ...registerData, specialization: filtered });
                      }}>✕</span>
                    </span>
                  ))}
                </div>
              </>
            )}
            <button type="submit" className="submit-btn">Register</button>
          </form>
        )}

        {/* RAMFINCORP LOAN APPLICATION VIEW */}
        {activeTab === 'loan' && (
          <form onSubmit={handleLoanSubmit}>
            <h2>Ramfincorp Loan Gateway</h2>
            <p className="subtitle">Submit verified financial leads directly to pre-production endpoints.</p>

            <div className="input-group">
              <label>Applicant Full Name</label>
              <input type="text" required value={loanData.name} onChange={(e) => setLoanData({ ...loanData, name: e.target.value })} placeholder="As printed on PAN Card" />
            </div>

            <div className="input-group">
              <label>Date of Birth</label>
              <input type="date" required value={loanData.dob} onChange={(e) => setLoanData({ ...loanData, dob: e.target.value })} />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input type="email" required value={loanData.email} onChange={(e) => setLoanData({ ...loanData, email: e.target.value })} placeholder="applicant@email.com" />
            </div>

            <div className="input-group">
              <label>Requested Loan Amount (₹)</label>
              <input type="number" required value={loanData.loanAmount} onChange={(e) => setLoanData({ ...loanData, loanAmount: e.target.value })} placeholder="e.g. 500000" />
            </div>

            <div className="input-group">
              <label>employee Framework Type</label>
              <select value={loanData.employee} onChange={(e) => setLoanData({ ...loanData, employee: e.target.value })}>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Full-Time">Full-Time</option>
              </select>
            </div>

            <div className="input-group">
              <label>PAN Card Number</label>
              <input type="text" required maxLength="10" value={loanData.pancard} onChange={(e) => setLoanData({ ...loanData, pancard: e.target.value.toUpperCase() })} placeholder="ABCDE1234F" />
            </div>

            <div className="input-group">
              <label>Verified Mobile Number</label>
              <input type="tel" required maxLength="10" value={loanData.mobile} onChange={(e) => setLoanData({ ...loanData, mobile: e.target.value })} placeholder="10-digit mobile number" />
            </div>

            <button type="submit" className="submit-btn primary">Dispatch Lead to Partner</button>
          </form>
        )}

      </main>
    </div>
  );
}

export default App;