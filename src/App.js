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

const App = () => {
  
 const [products, setProducts] = useState([]);
  const categories = ['Женщинам', 'Мужчинам', 'Обувь', 'Детям', 'Дом', 'Новый год', 'Красота', 'Аксессуары', 'Электроника', 'Игрушки', 'Мебель', 'Товары для взрослых', 'Бытовая техника', 'Зоотовары', 'Спорт', 'Автотовары', 'Ювелирные изделия', 'Для ремонта', 'Сад и дача', 'Здоровье', 'Канцтовары'];
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSteps, setUserSteps] = useState([]);
  const baseURL = 'https://testingnil.ru:8000/';
  // const [userInfo, setUserInfo] = useState([
  //   {
  //     id_usertg: 934574143,
  //     status: "admin",
  //     username: "The_Ivers",
  //   }
  // ]);
    /*  const [products, setProducts] = useState([
     {
       id: 1,
       image: "/Canada.jpg" ,
       name: 'Часы н1231аручные и Гелик 33ару33ару33ару33ару',
       description: 'Часы наручные 33ару33ару33ару33ару33ару33ару',
       terms: 'Оплата в течение 3-5 дней после публикации отзыва 33ару33ару33арувавававава   вававава   33ару',
       availableday: '15',
       marketprice: 1500000000000,
       yourprice: 130000000,
       discount: 1500000000000,
       step: "Завершено",
       keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного",
       article: "123456",
     category: "Женщинам",
     isComplete: true,
     },
     {
     id: 2,
       image: 'path_t211232o_image',
       name: 'Часы наручны2222е',
       description: 'Часы наручные',
       terms: 'Оплата в течение 3222-54444 дней после публикации отзыва',
       availableDay: 'Today',
       marketPrice: 1500,
       yourPrice: 1300,
       discount: 15,
     step: "Завершено",
       isComplete: true,
       keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного",
       article: "123456",
       category: "Мужчи1223123нам"
     },
     {
      id: 2,
        image: 'path_t211232o_image',
        name: 'Часы наручны2222е',
        description: 'Часы наручные',
        terms: 'Оплата в течение 3222-54444 дней после публикации отзыва',
        availableDay: 'Today',
        marketPrice: 1500,
        yourPrice: 1300,
        discount: 15,
      step: "Завершено",
        isComplete: true,
        keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного",
        article: "123456",
        category: "Мужч123123123инам"
      },
      {
        id: 2,
          image: 'path_t211232o_image',
          name: 'Часы наручны2222е',
          description: 'Часы наручные',
          terms: 'Оплата в течение 3222-54444 дней после публикации отзыва',
          availableDay: 'Today',
          marketPrice: 1500,
          yourPrice: 1300,
          discount: 15,
        step: "Завершено",
          isComplete: true,
          keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного",
          article: "123456",
          category: "Мужч12312312инам"
        },
        {
          id: 2,
            image: 'path_t211232o_image',
            name: 'Часы наручны2222е',
            description: 'Часы наручные',
            terms: 'Оплата в течение 3222-54444 дней после публикации отзыва',
            availableDay: 'Today',
            marketPrice: 1500,
            yourPrice: 1300,
            discount: 15,
          step: "Завершено",
            isComplete: true,
            keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного",
            article: "123456",
            category: "Мужчинам"
          },
          {
            id: 2,
              image: 'path_t211232o_image',
              name: 'Часы наручны2222е',
              description: 'Часы наручные',
              terms: 'Оплата в течение 3222-54444 дней после публикации отзыва',
              availableDay: 'Today',
              marketPrice: 1500,
              yourPrice: 1300,
              discount: 15,
            step: "Завершено",
              isComplete: true,
              keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного",
              article: "123456",
              category: "Мужчинам"
            },
                        

   ]);  */

   const API = {
    async getUser(id, username) {
      try {
        const option = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const res = await fetch(`${baseURL}getUser.php?id=${id}&username=${username}`, option).then(res => res.json());
        return res;
      } catch (err) {
        console.log(err);
      }
    },
    async createUser(id, username) {
      try {
        const option = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: id, username: username }),
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
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        const res = await fetch(`${baseURL}getSteps.php?id_usertg=${id_usertg}`, option).then(res => res.json());
        return res;
      } catch (err) {
        console.log(err);
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
    localStorage.clear();
    const tg = window.Telegram.WebApp;
    tg.expand();


    const fetchData = async () => {
      try {
        const userId = tg.initDataUnsafe.user.id;
       const username = tg.initDataUnsafe.user.username;
       // const username = '';

        console.log('User ID:', userId);
        console.log('Username:', username);

        let valid = true; // Объявляем переменную valid здесь

        const response = await API.getUser(userId, username);
        if (!response.success) {
          const createResponse = await API.createUser(userId, username);
          if (createResponse.success === true) {
            const newUserResponse = await API.getUser(userId, username);
            if (!newUserResponse.validUsername) {
              alert('Ваше имя пользователя не было распознано. Пожалуйста, введите его сверху на странице профиля. Вводите без @ в начале.');
              valid = false; // Обновляем значение valid
            }
            setUserInfo(newUserResponse.data);
            fetchProducts();
            setIsLoading(false);
          }
        } else {
          if (!response.validUsername) {
            alert('Ваше имя пользователя не было распознано. Пожалуйста, введите его сверху на странице профиля. Вводите без @ в начале.');
            valid = false; // Обновляем значение valid
          }
          setUserInfo(response.data);
          fetchProducts();
          setIsLoading(false);
        }

        const stepsResponse = await API.getUserSteps(userId);
        if (stepsResponse.success) {
          console.log('User Steps:', stepsResponse.data);
          setUserSteps(stepsResponse.data);
          
          if (!valid) {
            
          }
        } else {
          console.error('Failed to fetch user steps:', stepsResponse.error);
        }
      } catch (e) {
        console.log(e);
      }
    };

  fetchData();
}, []);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  const handleStepComplete = (step, formData) => {
    // Логика для обработки завершения шага
  };

  return (
    <Router>
      <div className="app-container">
        <BackButton /> 
        <Sidebar />
        <div className="content">
          <Routes>
            <Route exact path="/" element={<CatalogPage products={products} categories={categories} />} />
            <Route path="/catalog" element={<CatalogPage products={products} categories={categories}/>} />
            <Route path="/catalog-moderate" element={<CatalogPageModerate products={products} categories={categories}/>} />
            <Route path="/add-product" element={<AddProductPage userInfo={userInfo} fetchProducts={fetchProducts} products={products} setProducts={setProducts} categories={categories} />} />
            <Route path="/purchases" element={<PurchasesPage  userSteps={userSteps} userInfo={userInfo} />} />
            <Route path="/profile" element={<ProfilePage userInfo={userInfo}/>} />
            <Route path="/product/:id" element={<ProductDetail userSteps={userSteps} fetchUserSteps={fetchUserSteps} products={products} userInfo={userInfo} fetchProducts={fetchProducts} />} />
            <Route path="/purchase-steps/:id" element={<PurchaseStepsPage fetchProducts={fetchProducts} userInfo={userInfo} userSteps={userSteps} fetchUserSteps={fetchUserSteps} onStepComplete={handleStepComplete} />} />
            <Route path="/report/:id" element={<ReportPage userInfo={userInfo}/> } />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;