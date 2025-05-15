// frontend/src/components/Routing/PrivateRoute.jsx

// React importuna gerek yok eğer React.Fragment veya React.Component gibi şeyler kullanılmıyorsa.
// import React from 'react'; 
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * PrivateRoute bileşeni, belirli rotalara yalnızca kimliği doğrulanmış kullanıcıların erişmesini sağlar.
 * Eğer kullanıcı giriş yapmamışsa, login sayfasına yönlendirir.
 * Opsiyonel olarak 'allowedRoles' prop'u ile rol bazlı yetkilendirme de eklenebilir.
 *
 * @param {object} props - Bileşen prop'ları.
 * @param {string[]} [props.allowedRoles] - Bu rotaya erişimine izin verilen kullanıcı rolleri listesi.
 * @returns {JSX.Element} Kullanıcının yetkisi varsa Outlet (alt rota), yoksa Navigate (yönlendirme).
 */
const PrivateRoute = ({ allowedRoles }) => {
    // Redux store'dan kullanıcı kimlik doğrulama durumunu ve kullanıcı bilgilerini al
    const { token, user } = useSelector((state) => state.auth);
    const location = useLocation(); // Kullanıcının gitmek istediği mevcut konumu al

    // 1. Token Kontrolü: Kullanıcı giriş yapmış mı?
    if (!token) {
        // Kullanıcı giriş yapmamış.
        // Login sayfasına yönlendir. 'state' ile kullanıcının gitmek istediği orijinal yol ('from') saklanır,
        // böylece giriş yaptıktan sonra o sayfaya geri yönlendirilebilir.
        // 'replace' prop'u, tarayıcı geçmişinde login sayfasının mevcut sayfanın üzerine yazılmasını sağlar,
        // böylece kullanıcı geri tuşuna bastığında korumalı sayfaya tekrar dönemez.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Rol Kontrolü (Eğer 'allowedRoles' prop'u tanımlanmışsa ve 'user' objesi varsa):
    // Not: Backend'den gelen 'user' objesinde bir 'role' alanı olmalıdır.
    if (allowedRoles && user && user.role && !allowedRoles.includes(user.role)) {
        // Kullanıcının rolü, izin verilen roller arasında değil.
        // Yetkisiz erişim sayfasına (eğer varsa) veya ana sayfaya yönlendir.
        // Şimdilik basitçe ana sayfaya yönlendirelim.
        // alert(`Bu sayfaya erişim yetkiniz bulunmamaktadır. Gerekli rol: ${allowedRoles.join(', ')}`);
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Kullanıcı giriş yapmış ve (eğer rol kontrolü varsa) rolü uygun.
    // İstenen iç içe geçmiş rotayı (child route) veya bileşeni render etmek için <Outlet /> kullanılır.
    return <Outlet />;
};

export default PrivateRoute;
