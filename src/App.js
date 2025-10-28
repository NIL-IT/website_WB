import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink} from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import CatalogPageModerate from './pages/CatalogPageModerate';
import AddProductPage from './pages/AddProductPage';
import PurchasesPage from './pages/PurchasesPage';
import ProfilePage from './pages/ProfilePage';
import ReportPage from './pages/ReportPage';
import ProductDetail from './components/ProductDetail';
import PurchaseStepsPage from './pages/PurchaseStepsPage';
import Sidebar from './components/Sidebar';
import BackButton from './components/BackButton';
import './index.css';
import logo from './assets/logo.png'; // Убедитесь, что путь к изображению правильный
import ConfirmationPage from './pages/ConfirmationPage';


const App = () => {
  const [products, setProducts] = useState([]);
  const categories = ['Женщинам', 'Мужчинам', 'Обувь', 'Детям', 'Дом', 'Новый год', 'Красота', 'Аксессуары', 'Электроника', 'Игрушки', 'Мебель', 'Товары для взрослых', 'Бытовая техника', 'Зоотовары', 'Спорт', 'Автотовары', 'Ювелирные изделия', 'Для ремонта', 'Сад и дача', 'Здоровье', 'Канцтовары'];
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogo, setShowLogo] = useState(true); // Добавлено состояние для отображения логотипа
  const [userSteps, setUserSteps] = useState([]);
  const baseURL = 'https://inhomeka.online:8000/';
  const [isUserInfoLoaded, setIsUserInfoLoaded] = useState(false); // Новый флаг
  const [referralId, setReferralId] = useState(null); // Новый стейт для реферрала
  const [isBlocked, setIsBlocked] = useState(false); // Блокировка пользователя
  const API = {
    async getUser(id, username) {
        try {
            const option = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id, username: username })
            };
            const res = await fetch(`${baseURL}getUser.php`, option).then(res => res.json());
            return res;
        } catch (err) {
            console.log(err);
        }
    },
    async createUser(id, username, referral_id = null) {
      try {
        const body = { id: id, username: username };
        if (referral_id) body.referral_id = referral_id;
        const option = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        };
        const res = await fetch(`${baseURL}createUser.php`, option).then(res => res.json());
        return res;
      } catch (err) {
        console.log(err);
      }
    },
    async getProducts() {
      try {
        const option = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const res = await fetch(`${baseURL}getProducts.php`, option).then(res => res.json());
        return res;
      } catch (err) {
        console.log(err);
      }
    },
    async getUserSteps(id_usertg) {
      try {
          const option = {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id_usertg: id_usertg }),
          };
          const res = await fetch(`${baseURL}getSteps.php`, option);
          if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          return data;
      } catch (err) {
          console.error("Error:", err);
          return { success: false, message: err.message };
      }
  },
  };

  const fetchProducts = async () => {
    try {
      const response = await API.getProducts();
      if (response.success) {
        setProducts(response.data); 
      } else {
        console.error('Failed to fetch products:', response.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchUserSteps = async (id_usertg) => {
    try {
        const response = await API.getUserSteps(id_usertg);
        console.log('API Response:', response);
        if (response.success) {
            setUserSteps(response.data);
            return response.data;
        } else {
            console.error('Failed to fetch user steps:', response.message);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user steps:', error);
        return null;
    }
};
  useEffect(() => {
    // Получение referral из URL (?refferal=...)
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('refferal');
    if (ref) setReferralId(ref);

    localStorage.clear();
    const tg = window.Telegram.WebApp;
    tg.expand(); // Расширяет приложение на весь экран


    const fetchData = async () => {
      try {
        const userId = tg.initDataUnsafe.user.id;
        const username = tg.initDataUnsafe.user.username;
        // const username = '';

        console.log('User ID:', userId);
        console.log('Username:', username);

        let valid = true; // Объявляем переменную valid здесь

        const response = await API.getUser(userId, username);
         // Если сервер явно сообщает о блокировке — останавливаем дальнейшую инициализацию
        if (response && response.success === false && response.blocked === true) {
          setIsBlocked(true);
          setIsLoading(false);
          return; // Прерываем fetchData — не делаем других запросов
        }

        if (!response.success) {
          // Передаем referralId если есть
          const createResponse = await API.createUser(userId, username, ref || referralId);
          if (createResponse.success === true) {
            const newUserResponse = await API.getUser(userId, username);
            if (!newUserResponse.validUsername) {
              alert('Ваше имя пользователя не было распознано. Введите его в аккаунте тг. Либо введите его сверху на странице профиля в приложении. Вводите без @ в начале.');
              valid = false; // Обновляем значение valid
            }
            setUserInfo(newUserResponse.data);
          }
        } else {
          if (!response.validUsername) {
            alert('Ваше имя пользователя не было распознано. Введите его в аккаунте тг. Либо введите его сверху на странице профиля в приложении. Вводите без @ в начале.');
            valid = false; // Обновляем значение valid
          }
          setUserInfo(response.data);
        }

        setIsUserInfoLoaded(true); // Устанавливаем флаг после загрузки данных пользователя

        const stepsResponse = await API.getUserSteps(userId);
        if (stepsResponse.success) {
          console.log('User Steps:', stepsResponse.data);
          setUserSteps(stepsResponse.data);

          if (!valid) {

          }
        } else {
          console.error('Failed to fetch user steps:', stepsResponse.error);
        }

        fetchProducts();
        setIsLoading(false);
      } catch (e) {
        console.log(e);
      }
    };

  fetchData();

  // Устанавливаем таймер для скрытия логотипа через 1 секунду
  const timer = setTimeout(() => {
    setShowLogo(false);
  }, 1500);

  return () => clearTimeout(timer); // Очищаем таймер при размонтировании компонента
  }, []);

  if (isBlocked) {
  // Экран при блокировке
  return (
    <div className="blocked-overlay" role="alert" aria-live="assertive">
      <div className="blocked-overlay__box">
        <h2>Доступ заблокирован</h2>
        <p>
          Ваш аккаунт заблокирован. Для уточнения обратитесь в службу поддержки.
        </p>
        <div>
          <a
            href="https://t.me/razdadim5"
            className="blocked-overlay__link"
          >
            Связаться со службой поддержки
          </a>
        </div>
      </div>
    </div>
  );
}

// После этого проверяем загрузку
if (isLoading || !isUserInfoLoaded) {
  return (
    <div className="flex justify-center items-center w-full h-full min-h-screen">
      {showLogo ? (
        <img
          src={logo}
          alt="Loading Logo"
          className="fade-out max-w-full max-h-full object-contain"
          style={{ width: "100vw", height: "100vh" }}
        />
      ) : (
        <span className="loader"></span>
      )}
    </div>
  );
}
  
  const handleStepComplete = (step, formData) => {
    // Логика для обработки завершения шага
  };

  return (
    <Router>
      <div className="app-container">
        <BackButton />
        <Sidebar userInfo={userInfo} />
        <div className="content">
          <Routes>
            <Route exact path="/" element={<CatalogPage products={products} categories={categories} />} />
            <Route path="/catalog" element={<CatalogPage products={products} categories={categories} />} />
            <Route path="/catalog-moderate" element={<CatalogPageModerate products={products} categories={categories} />} />
            <Route path="/add-product" element={<AddProductPage userInfo={userInfo} fetchProducts={fetchProducts} products={products} setProducts={setProducts} categories={categories} />} />
            <Route path="/publishWithChanges" element={<AddProductPage userInfo={userInfo} fetchProducts={fetchProducts} />} />
            <Route path="/purchases" element={<PurchasesPage userSteps={userSteps} userInfo={userInfo} />} />
            <Route path="/profile" element={<ProfilePage userInfo={userInfo} />} />
            <Route path="/product/:id" element={<ProductDetail userSteps={userSteps} fetchUserSteps={fetchUserSteps} products={products} userInfo={userInfo} fetchProducts={fetchProducts} />} />
            <Route path="/purchase-steps/:id" element={<PurchaseStepsPage fetchProducts={fetchProducts} userInfo={userInfo} userSteps={userSteps} fetchUserSteps={fetchUserSteps} onStepComplete={handleStepComplete}/>} />
            <Route path="/confirmation" element={<ConfirmationPage userInfo={userInfo} />} />
            <Route path="/report/:id" element={<ReportPage userInfo={userInfo} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
