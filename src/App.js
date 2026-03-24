import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import CatalogPageModerate from './pages/CatalogPageModerate';
import AddProductPage from './pages/AddProductPage';
import HomePage from './pages/HomePage';
import PurchasesPage from './pages/PurchasesPage';
import ProfilePage from './pages/ProfilePage';
import ReportPage from './pages/ReportPage';
import SupportPage from './pages/SupportPage';
import ProductDetail from './components/ProductDetail';
import PurchaseStepsPage from './pages/PurchaseStepsPage';
import Sidebar from './components/Sidebar';
import AppHeader from './components/AppHeader';
import BackButton from './components/BackButton';
import InstallPrompt from './components/InstallPrompt';
import { getProducts } from './api/products';
import { getUserSteps } from './api/steps';
import { createUser, getUser } from './api/users';
import { getPlatformContext, initializePlatform } from './platform';
import logo from './assets/logo.png'; // Убедитесь, что путь к изображению правильный
import ConfirmationPage from './pages/ConfirmationPage';


const App = () => {
  const [products, setProducts] = useState([]);
  const categories = ['Женщинам', 'Мужчинам', 'Обувь', 'Детям', 'Дом', 'Новый год', 'Красота', 'Аксессуары', 'Электроника', 'Игрушки', 'Мебель', 'Товары для взрослых', 'Бытовая техника', 'Зоотовары', 'Спорт', 'Автотовары', 'Ювелирные изделия', 'Для ремонта', 'Сад и дача', 'Здоровье', 'Канцтовары'];
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogo, setShowLogo] = useState(true); // Добавлено состояние для отображения логотипа
  const [userSteps, setUserSteps] = useState([]);
  const [isUserInfoLoaded, setIsUserInfoLoaded] = useState(false); // Новый флаг
  const [isBlocked, setIsBlocked] = useState(false); // Блокировка пользователя

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
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
        const response = await getUserSteps(id_usertg);
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
    const params = new URLSearchParams(window.location.search);
    const referralCode = params.get('refferal');

    const fetchData = async () => {
      try {
        initializePlatform();
        const platformContext = getPlatformContext();
        const userId = platformContext.user.id;
        const username = platformContext.user.username;
        const isTelegramUser = platformContext.type === 'telegram';

        console.log('User ID:', userId);
        console.log('Username:', username);

        const response = await getUser(userId, username);
         // Если сервер явно сообщает о блокировке — останавливаем дальнейшую инициализацию
        if (response && response.success === false && response.blocked === true) {
          setIsBlocked(true);
          setIsLoading(false);
          return; // Прерываем fetchData — не делаем других запросов
        }

        if (!response.success) {
          const createResponse = await createUser(userId, username, referralCode);
          if (createResponse.success === true) {
            const newUserResponse = await getUser(userId, username);
            if (isTelegramUser && !newUserResponse.validUsername) {
              alert('Ваше имя пользователя не было распознано. Введите его в аккаунте тг. Либо введите его сверху на странице профиля в приложении. Вводите без @ в начале.');
            }
            setUserInfo(newUserResponse.data);
          }
        } else {
          if (isTelegramUser && !response.validUsername) {
            alert('Ваше имя пользователя не было распознано. Введите его в аккаунте тг. Либо введите его сверху на странице профиля в приложении. Вводите без @ в начале.');
          }
          setUserInfo(response.data);
        }

        setIsUserInfoLoaded(true); // Устанавливаем флаг после загрузки данных пользователя

        const stepsResponse = await getUserSteps(userId);
        if (stepsResponse.success) {
          setUserSteps(stepsResponse.data);
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
        <InstallPrompt />
        <AppHeader userInfo={userInfo} userSteps={userSteps} />
        <Sidebar />
        <div className="content">
          <Routes>
            <Route exact path="/" element={<HomePage userInfo={userInfo} userSteps={userSteps} products={products} />} />
            <Route path="/catalog" element={<CatalogPage products={products} categories={categories} />} />
            <Route path="/catalog-moderate" element={<CatalogPageModerate products={products} categories={categories} />} />
            <Route path="/add-product" element={<AddProductPage userInfo={userInfo} fetchProducts={fetchProducts} products={products} setProducts={setProducts} categories={categories} />} />
            <Route path="/publishWithChanges" element={<AddProductPage userInfo={userInfo} fetchProducts={fetchProducts} />} />
            <Route path="/purchases" element={<PurchasesPage userSteps={userSteps} userInfo={userInfo} />} />
            <Route path="/support" element={<SupportPage />} />
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
