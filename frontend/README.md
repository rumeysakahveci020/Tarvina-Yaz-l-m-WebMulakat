# ✒️ Kalem Meydanı - Yazıların Eğlenceli Rekabet Arenası!

Selamlar! 👋 Bu platform, **Kalem Meydanı**, Tarvina Yazılım Web Mülakat Görevi için büyük bir heyecanla geliştirdiğim, kullanıcıların blog yazılarını paylaşıp bu yazıların kıyasıya yarıştığı, oylama tabanlı bir full-stack web uygulamasıdır.

Fikir basit ama eğlenceli: Yazarlar eserlerini meydana sürer, okuyucular ise jüri koltuğuna oturup en beğendikleri kalemi bir sonraki tura taşır. 

## ✨Temel Özellikler

*   **Güvenli Giriş:** JWT ile kullanıcı kaydı ve kimlik doğrulama. Herkesin kalemi güvende!
*   **Yazı Atölyesi:** Kullanıcılar kendi blog yazılarını (başlık, içerik, çarpıcı bir özet, kategori ve görselle) kolayca oluşturabilir. (Düzenleme/silme için altyapı hazır.)
*   **Düello Zamanı!:** Yazılar, sistem tarafından (veya ileride admin tarafından) eşleştirilerek birbirleriyle rekabete girer.
*   **Oy Ver, Sesi Duyur:** Giriş yapan okuyucular, iki yazı arasında beğendiklerine oy vererek favorilerini destekler.
*   **Anlık Sonuçlar:** Oylama sonrası sonuçlar (yüzdeler ve oy sayıları) tatlı bir animasyonla ekrana yansır.
*   **Kazananlar Kürsüye:** En çok oyu alan yazı, bir sonraki aşamaya geçer. (Tam bir turnuva sistemi için harika bir başlangıç!)
*   **Kalem Seviyeleri (Altyapı):** Yazı sayısı ve kazanılan düellolara göre "Çaylak Kalem"den "Usta Kalem"e uzanan bir yolculuk.
*   **Her Ekranda Şık:** Responsive tasarım ilkeleriyle geliştirilmeye çalışıldı.

## 🛠️ Mutfaktaki Malzemeler (Kullanılan Teknolojiler)

*   **Frontend (Kullanıcı Arayüzü):**
    *   React (Vite ile hızlı bir başlangıç)
    *   Redux Toolkit (Global state'lerimizi toplu tutmak için)
    *   React Router DOM v6 (Sayfalar arası akıcı geçişler için)
    *   Axios (Backend ile haberleşmek için)
    *   Tailwind CSS (Modern ve hızlı UI geliştirmek için biçilmiş kaftan!)
*   **Backend (API ve Veritabanı):**
    *   Node.js & Express.js (Güçlü ve esnek API'ler için)
    *   MongoDB & Mongoose (NoSQL veritabanı ve kolay modelleme için)
    *   JWT (JSON Web Tokens) (Girişlerin güvenliği için)
    *   Bcryptjs (Şifreleri güvenle saklamak için)
    *   Dotenv (Gizli bilgileri korumak için)
    *   CORS (Farklı kaynaklardan erişim için)

## 🚀 Kalem Meydanı'nı Kendi Bilgisayarında Kur!

Bu heyecana ortak olmak istersen, aşağıdaki adımları izleyerek projeyi kendi ortamında çalıştırabilirsin:

### Olmazsa Olmazlar 

*   [Node.js](https://nodejs.org/) (Önerilen: LTS v18.x veya v20.x - Ben Node.js v16.20.2 ile geliştirdim, paket versiyonları buna göre ayarlandı.)
*   [npm](https://www.npmjs.com/) (Node.js ile birlikte gelir)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Lokalde kurulu ve çalışır durumda olmalı ya da bir MongoDB Atlas URI'n olmalı)
*   [Git](https://git-scm.com/) (Projeyi klonlamak için)

### Kurulum Aşamaları

1.  **Projeyi Çek:**
    ```bash
    git clone https://github.com/SENIN_GITHUB_KULLANICI_ADIN/kalem-meydani.git 
    # veya proje adın neyse o
    cd kalem-meydani
    ```

2.  **Backend'i Ayaklandır:**
    *   Backend klasörüne geç: `cd backend`
    *   Gerekli paketleri sihirli bir şekilde indir: `npm install`
    *   `backend` klasörünün içine `.env` adında bir dosya oluştur ve sihirli anahtarlarını gir (örnek aşağıda, kendininkilerle değiştir):
        ```env
        PORT=5001
        MONGO_URI=mongodb://localhost:27017/kalemmeydani
        JWT_SECRET=BU_COK_GIZLI_BIR_ANAHTAR_OLMALI_SAKIN_PAYLASMA
        NODE_ENV=development
        ```
    *   MongoDB sunucunun çalıştığından emin ol! 🐉

3.  **Frontend'i Canlandır:**
    *   Ana proje klasörüne dön (`cd ..`) ve frontend klasörüne geç: `cd frontend`
    *   Gerekli paketleri indir: `npm install`
        *   *(Not: Eğer `ERESOLVE` hatası alırsan, `npm install --legacy-peer-deps` komutunu deneyebilirsin.)*
    *   `frontend` klasörünün içine `.env.development` adında bir dosya oluştur ve sihirli bağlantını kur:
        ```env
        VITE_API_URL=http://localhost:5001/api
        ```

### Ve Sahne Senin! (Uygulamayı Başlatma)

1.  **Backend Motorunu Çalıştır:**
    *   `kalem-meydani/backend` klasöründeyken:
        ```bash
        npm run server
        ```
    *   Terminalde "Sunucu ... portunda başarıyla başlatıldı" ve "MongoDB Bağlantısı Başarılı" gibi dostane mesajlar görmelisin.

2.  **Frontend Sahnesini Kur:**
    *   **AYRI BİR TERMİNALDE**, `kalem-meydani/frontend` klasöründeyken:
        ```bash
        npm run dev
        ```
    *   Vite sana sihirli bir adres verecek: "Local: http://localhost:XXXX/" (Genellikle 5173 veya civarı bir port).

3.  **Perde! (Siteyi Ziyaret Et):**
    *   Tarayıcını aç ve Vite'ın verdiği local adrese git.

Kalem Meydanı'nın kapıları sana açık!

## 🗒️ Geliştirme Serüvenim ve Mevcut Durum

Bu projeyi geliştirirken hem çok keyif aldım hem de birçok yeni şey öğrendim. Özellikle backend ve frontend arasındaki veri akışını yönetmek, Redux ile state kontrolü ve asenkron işlemler üzerinde çalışmak benim için değerli deneyimler oldu.

**Ancak, şu anda frontend tarafında bir render sorunu yaşıyorum:**

*   **Mevcut Durum:** Backend API'leri (Postman ile test edildiğinde) beklendiği gibi çalışıyor. Frontend projesi `npm install` ile kurulabiliyor ve `npm run dev` komutuyla Vite geliştirme sunucusu hatasız bir şekilde başlıyor (`ready in XXX ms` ve `Local: http://localhost:XXXX/` mesajlarını alıyorum).
*   **Sorun:** Vite'ın verdiği local adresi tarayıcıda açtığımda **bembeyaz bir sayfa** ile karşılaşıyorum.
*   **Denemelerim:**
    *   `index.html` dosyasının doğruluğunu ve `#root` elementinin varlığını kontrol ettim.
    *   `main.jsx` dosyasının `#root` elementine doğru şekilde render yapıp yapmadığını `console.log`'lar ekleyerek test ettim; `#root` elementi bulunuyor ve `ReactDOM.render` çağrılıyor gibi görünüyor.
    *   `App.jsx` dosyasını en basit "Merhaba Dünya" haline getirerek test ettim, ancak bu basit içerik bile tarayıcıda görünmedi.
    *   Tarayıcı geliştirici konsolunda (Console sekmesinde) **herhangi bir JavaScript hatası görünmüyor**, bu da sorunun kaynağını bulmayı zorlaştırıyor. Network sekmesinde `main.jsx` (veya Vite'ın derlediği hali) yükleniyor gibi görünüyor.
    *   Farklı tarayıcılar ve gizli mod denemeleri de maalesef sonucu değiştirmedi.
    *   Import yolları (`../`, `./`, `../../`) defalarca kontrol edildi ve düzeltildi.
    *   `index.css` dosyasını geçici olarak devre dışı bırakmak da bir sonuç vermedi.
*   **Tahminim:** Sorunun, Vite'ın dosyaları tarayıcıya sunma şekli, temel bir JavaScript yüklenme/çalıştırılma problemi veya gözden kaçırdığım çok temel bir konfigürasyon eksiği olabileceğini düşünüyorum. Süre kısıtı nedeniyle bu render sorununu tam olarak çözüme kavuşturamadım.
*   **Değerlendirme Ricam:** Kodun backend kısmı, frontend'in derlenebilir yapısı, Redux store/slice mantığı, bileşen ve sayfa yapılarının incelenerek değerlendirilmesini umuyorum.



## 🤗 Teşekkürler!

Bu projeyi tamamlama sürecinde gösterdiğim çabanın ve öğrendiklerimin değerlendirilmesi benim için çok değerli. Zaman ayırdığınız için teşekkür ederim ve geri bildirimlerinizi heyecanla bekliyorum!

---
**[Rumeysa KAHVECİ]**
[GitHub: github.com/rumeysakahveci020]
[E-posta: rumeysa.kahveci020@gmail.com]