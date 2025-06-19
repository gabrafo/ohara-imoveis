import React, { useState } from "react";
import "./RegisterScreen.css";
import logo from "../../assets/logo.svg";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("+55");
  const [birthDate, setBirthDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\+55\d*$/.test(value) || value === "+5") {
      setPhone(value);
    }
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value.length <= 10 && /^(\d{0,2}-?(\d{0,2}-?(\d{0,4})?)?)?$/.test(value)) {
      let formattedValue = value;
      
      if (value.length === 2 && !value.includes('-')) {
        formattedValue = value + '-';
      } else if (value.length === 5 && value.charAt(2) === '-' && !value.includes('-', 3)) {
        formattedValue = value + '-';
      }
      
      setBirthDate(formattedValue);
    }
  };

  const isStrongPassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  };
  

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = "O nome é obrigatório";
    if (!email) newErrors.email = "O e-mail é obrigatório";
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) 
      newErrors.email = "Formato de e-mail inválido";
    
    if (!password) newErrors.password = "A senha é obrigatória";

    if (password.length < 8) {  
      newErrors.password = "A senha deve ter no mínimo 8 caracteres";
    }

    if (!isStrongPassword(password)) {
      newErrors.password = "A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial";
    }
    
    if (phone.length < 13) 
      newErrors.phone = "Telefone deve estar no formato +55DDD999999999";
    
    if (!/^\d{2}-\d{2}-\d{4}$/.test(birthDate)) 
      newErrors.birthDate = "Data deve estar no formato DD-MM-YYYY";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await register({
        name,
        email,
        password,
        phone,
        birthDate
      });
      
      navigate("/home");
    } catch (err: any) {
      console.error("Erro ao registrar:", err);

      if (err.response?.status === 409) {
        if (err.response.data.message.includes("e-mail")) {
          setErrors(prev => ({ ...prev, email: "Este e-mail já está cadastrado" }));
        }
        if (err.response.data.message.includes("telefone")) {
          setErrors(prev => ({ ...prev, phone: "Este telefone já está cadastrado" }));
        }
      } else if (err.response?.data?.message) {
        setErrors(prev => ({ ...prev, general: err.response.data.message }));
      } else {
        setErrors(prev => ({ ...prev, general: "Erro ao cadastrar. Tente novamente." }));
      }
    }
  };

  return (
    <div className="register-container">
      <div className="form-section">
        <h1>Bem-vindo à Ohara Imóveis!</h1>
        <p>Faça seu cadastro para ter acesso completo à nossa plataforma.</p>

        {errors.general && <div className="error-message" style={{ color: 'red' }}>{errors.general}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Nome</label>
            <input
              type="text"
              id="name"
              placeholder="Digite seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              placeholder="Digite sua senha (mínimo 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="phone">Telefone</label>
            <input
              type="tel"
              id="phone"
              placeholder="+55DDD999999999"
              value={phone}
              onChange={handlePhoneChange}
              required
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="birthDate">Data de Nascimento</label>
            <input
              type="text"
              id="birthDate"
              placeholder="DD-MM-YYYY"
              value={birthDate}
              onChange={handleBirthDateChange}
              required
            />
            {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
          </div>

          <button type="submit">Cadastrar</button>
        </form>

        <div className="login-link">
          Já tem uma conta? <a href="/login">Entrar</a>
        </div>
      </div>

      <div className="logo-section">
        <img src={logo} alt="Ohara Imóveis Logo" className="logo-pic" />
      </div>
    </div>
  );
};

export default RegisterScreen;