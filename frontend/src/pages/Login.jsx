import { useState } from 'react' ;
import { useNavigate } from 'react-router-dom' ;
import API from '../api/axios' ;

export default function Login(){
    const [email,setEmail] = useState('') ;
    const [password , setPassword] = useState(' ') ;
    const [error , setError] = useState('') ;


const navigate = useNavigate() ;

const handleLogin = async(e) => {
    e.preventDefault();
    setError("") ;


try {
    console.log("LOGGING IN ....")

    const response = await API.post('/auth/login' ,{
        email : email.trim() ,
        password : password.trim()

    }) ;
    console.log("Login Sucess :"  , response.data ) ;
    navigate('/feed') ;

}catch (err) {
    console.error("login error" , err)
    setError(err.response?.data?.message || 'Server se connect nahi ho paya.');
    
}
};

return (
    <div style={{ maxWidth: '400px', margin: '80px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>CampusConnect</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>Sign in to continue</p>

      {/* Agar koi error aaya toh yahan laal rang mein dikhega */}
      {error && <div style={{ color: '#e74c3c', backgroundColor: '#fadbd8', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        <button 
          type="submit" 
          style={{ padding: '12px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
        >
          Log In
        </button>
      </form>
    </div>
  );
}