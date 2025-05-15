// frontend/src/components/Layout/Navbar.jsx


import { Link, useNavigate, NavLink } from 'react-router-dom'; // NavLink eklendi (aktif link stili için)
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset as resetAuth } from '../../features/auth/authSlice.js'; // reset'in adı resetAuth olarak değiştirildi (diğer resetlerle çakışmasın diye)
// Diğer slice'lardan reset fonksiyonları da import edilebilir
// import { resetPostState } from '../../features/posts/postSlice.js';
// import { resetBattleState } from '../../features/battle/battleSlice.js';

function Navbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, token } = useSelector((state) => state.auth); // auth state'inden kullanıcı ve token bilgisi

    const onLogoutHandler = () => {
        dispatch(logout()); // Kullanıcı çıkış action'ını dispatch et
        dispatch(resetAuth()); // Auth state'ini sıfırla
        // İsteğe bağlı olarak diğer state'leri de sıfırlayabilirsiniz
        // dispatch(resetPostState());
        // dispatch(resetBattleState());
        navigate('/login'); // Çıkış sonrası login sayfasına yönlendir
    };

    // NavLink için aktif stil class'ı
    const activeLinkStyle = "bg-gray-900 text-white";
    const inactiveLinkStyle = "text-gray-300 hover:bg-gray-700 hover:text-white";
    const navLinkClasses = ({ isActive }) =>
        `${isActive ? activeLinkStyle : inactiveLinkStyle} px-3 py-2 rounded-md text-sm font-medium transition-colors`;

    return (
        <nav className="bg-gray-800 text-white fixed w-full top-0 z-50 shadow-md"> {/* z-50 eklendi */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Sol Taraf - Site Adı */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold hover:text-gray-300 transition-colors">
                            Kalem Meydanı
                        </Link>
                    </div>

                    {/* Orta Kısım - Ana Navigasyon Linkleri (Masaüstü) */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <NavLink to="/" className={navLinkClasses} end> {/* 'end' prop'u tam eşleşme için */}
                                Ana Sayfa
                            </NavLink>
                            <NavLink to="/battle" className={navLinkClasses}>
                                MEYDAN!
                            </NavLink>
                            {/* Başka genel linkler buraya eklenebilir */}
                        </div>
                    </div>

                    {/* Sağ Taraf - Kullanıcı İşlemleri */}
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {token && user ? ( // Kullanıcı giriş yapmışsa
                                <>
                                    <NavLink
                                        to="/create-post"
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors mr-3"
                                    >
                                        Yeni Yazı Ekle
                                    </NavLink>
                                    <div className="relative">
                                        <button
                                            onClick={() => navigate('/my-profile')} // Kendi profiline git
                                            className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                                        >
                                            <span className="sr-only">Kullanıcı menüsünü aç</span>
                                            <img
                                                className="h-8 w-8 rounded-full object-cover"
                                                src={user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&size=128&color=fff`}
                                                alt={user.username}
                                            />
                                        </button>
                                        {/* Dropdown menü eklenebilir */}
                                    </div>
                                    <button
                                        onClick={onLogoutHandler}
                                        className={`${inactiveLinkStyle} ml-3 px-3 py-2 rounded-md text-sm font-medium`}
                                    >
                                        Çıkış Yap
                                    </button>
                                </>
                            ) : ( // Kullanıcı giriş yapmamışsa
                                <div className="space-x-2">
                                    <NavLink to="/login" className={navLinkClasses}>
                                        Giriş Yap
                                    </NavLink>
                                    <NavLink
                                        to="/register"
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Kayıt Ol
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobil Menü Butonu (Gerekirse eklenebilir) */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            // onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Mobil menü state'i gerekir
                            type="button"
                            className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded="false" // Mobil menü state'ine göre değişir
                        >
                            <span className="sr-only">Ana menüyü aç</span>
                            {/* İkon: Menü açıkken X, kapalıyken hamburger */}
                            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobil Menü (Gerekirse açılır kapanır yapılır) */}
            {/* 
            <div className="md:hidden" id="mobile-menu">
                {isMobileMenuOpen && (
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink to="/" className={navLinkClassesMobile} end>Ana Sayfa</NavLink>
                        <NavLink to="/battle" className={navLinkClassesMobile}>MEYDAN!</NavLink>
                        {token && user ? (
                            <>
                                <NavLink to="/create-post" className={navLinkClassesMobile}>Yeni Yazı Ekle</NavLink>
                                <NavLink to="/my-profile" className={navLinkClassesMobile}>Profilim</NavLink>
                                <button onClick={onLogoutHandler} className={`${baseMobileLinkStyle} text-red-400 hover:bg-red-700 hover:text-white`}>
                                    Çıkış Yap
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className={navLinkClassesMobile}>Giriş Yap</NavLink>
                                <NavLink to="/register" className={navLinkClassesMobile}>Kayıt Ol</NavLink>
                            </>
                        )}
                    </div>
                )}
            </div> 
            */}
        </nav>
    );
}

// Mobil link stilleri için (eğer mobil menü eklenirse)
// const baseMobileLinkStyle = "block px-3 py-2 rounded-md text-base font-medium";
// const navLinkClassesMobile = ({ isActive }) => 
//    `${baseMobileLinkStyle} ${isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`;


export default Navbar;